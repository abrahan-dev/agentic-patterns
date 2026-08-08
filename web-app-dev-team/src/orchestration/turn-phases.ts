import {
  specificationReviewDecisionSchema,
  specifierTurnSchema,
  type AgentTurn,
  type Handoff,
  type LocalCheck,
  type Role,
  type RunState,
  type SpecificationReview,
} from "../domain/schemas.ts";
import { validateGherkin } from "../local/gherkin.ts";
import { runQualityGate } from "../local/quality-gate.ts";
import {
  loadWorkspaceFacts,
  refreshWorkspaceFacts,
} from "../local/workspace-inspector.ts";
import type { WorkspaceBootstrapper } from "../local/workspace-bootstrapper.ts";
import type { SpecificationJournal } from "../specifications/specification-journal.ts";
import {
  recordHandoff,
  recordHumanReviewRequested,
  recordLocalCheck,
  recordSpecificationReview,
  recordWorkspaceBootstrap,
} from "./operator-log.ts";
import { saveRunState } from "./run-store.ts";
import type { SpecificationReviewer } from "./specification-reviewer.ts";
import type { AcceptedTurn } from "./turn-execution.ts";
import { isCodeWritingRole, normalizeChangedFiles } from "./turn-routing.ts";

export interface TurnPhaseResult {
  turn: AgentTurn;
  repeatRole: boolean;
}

function handoffId(state: RunState): string {
  return `${state.id}-${String(state.messages.length).padStart(4, "0")}`;
}

function gherkinCheck(
  state: RunState,
  specification: string,
): {
  check: LocalCheck;
  featureId: string | null;
} {
  const validation = validateGherkin(specification);

  return {
    featureId: validation.featureId,
    check: {
      sequence: state.localChecks.length + 1,
      turn: state.turns,
      role: "specifier",
      kind: "gherkin",
      createdAt: new Date().toISOString(),
      passed: validation.errors.length === 0,
      summary:
        validation.errors.length === 0
          ? `Gherkin passed (${validation.scenarios.length} scenarios).`
          : `Gherkin failed with ${validation.errors.length} issue(s).`,
      details: validation.errors,
      commands: [],
    },
  };
}

async function repeatSpecifier(
  runDirectory: string,
  state: RunState,
  turn: AgentTurn,
): Promise<TurnPhaseResult> {
  state.currentRole = "specifier";
  await saveRunState(runDirectory, state);

  return { turn, repeatRole: true };
}

export async function processSpecificationPhase(options: {
  accepted: AcceptedTurn;
  runDirectory: string;
  state: RunState;
  reviewer: SpecificationReviewer;
  journal: SpecificationJournal;
}): Promise<TurnPhaseResult> {
  const { accepted, runDirectory, state, reviewer, journal } = options;

  if (accepted.role !== "specifier") {
    return { turn: accepted.turn, repeatRole: false };
  }

  let specification = specifierTurnSchema.parse(accepted.turn);
  const validation = gherkinCheck(state, specification.specification);
  state.localChecks.push(validation.check);
  await saveRunState(runDirectory, state);
  await recordLocalCheck(runDirectory, state, validation.check);

  if (!validation.check.passed || !validation.featureId) {
    return repeatSpecifier(runDirectory, state, specification);
  }

  specification = { ...specification, featureId: validation.featureId };
  await recordHumanReviewRequested(runDirectory, specification);
  const decision = specificationReviewDecisionSchema.parse(
    await reviewer.review({ state, specification }),
  );
  const reviewId = `${state.id}-specification-${String(
    state.specificationReviews.length + 1,
  ).padStart(4, "0")}`;
  const reviewBase = {
    id: reviewId,
    createdAt: new Date().toISOString(),
    specification,
  };

  if (decision.decision === "changes_requested") {
    const review: SpecificationReview = {
      ...reviewBase,
      ...decision,
      publishedSpecification: null,
    };
    state.specificationReviews.push(review);
    await recordSpecificationReview(runDirectory, review);

    return repeatSpecifier(runDirectory, state, specification);
  }

  const publishedSpecification = await journal.publish({
    workspace: state.workspace,
    sourceReviewId: reviewId,
    specification,
  });
  await journal.verify(state.workspace);
  const review: SpecificationReview = {
    ...reviewBase,
    ...decision,
    publishedSpecification,
  };
  state.specificationReviews.push(review);
  await recordSpecificationReview(runDirectory, review);

  return {
    repeatRole: false,
    turn: {
      ...specification,
      artifacts: [...new Set([...specification.artifacts, publishedSpecification.path])],
    },
  };
}

export async function processBootstrapPhase(options: {
  turn: AgentTurn;
  runDirectory: string;
  state: RunState;
  bootstrapper: WorkspaceBootstrapper;
}): Promise<void> {
  const { turn, runDirectory, state, bootstrapper } = options;

  if (
    turn.role !== "architect" ||
    turn.nextRole === "specifier" ||
    state.workspaceBootstrap !== null
  ) {
    return;
  }

  const bootstrap = await bootstrapper.bootstrap(state.workspace, turn.changePlan);
  state.workspaceBootstrap = bootstrap;
  await refreshWorkspaceFacts(state.workspace, runDirectory);
  await saveRunState(runDirectory, state);
  await recordWorkspaceBootstrap(runDirectory, state, bootstrap);
}

export async function processQualityPhase(options: {
  accepted: AcceptedTurn;
  turn: AgentTurn;
  runDirectory: string;
  state: RunState;
}): Promise<TurnPhaseResult> {
  const { accepted, runDirectory, state } = options;
  let { turn } = options;

  if (!isCodeWritingRole(accepted.role) || turn.nextRole === "architect") {
    return { turn, repeatRole: false };
  }

  const gate = await runQualityGate({
    workspace: state.workspace,
    facts: await loadWorkspaceFacts(state.workspace, runDirectory),
    changedFiles: normalizeChangedFiles(
      accepted.result?.observations?.changedFiles ?? turn.artifacts,
      state.workspace,
    ),
    turn: state.turns,
    sequence: state.localChecks.length + 1,
    role: accepted.role,
    runScripts: turn.nextRole === "qa",
  });
  state.localChecks.push(gate);
  turn = {
    ...turn,
    evidence: [
      ...new Set([
        ...turn.evidence,
        ...gate.commands.map(({ command, exitCode }) => `${command}: exit ${exitCode}`),
      ]),
    ],
  };
  await saveRunState(runDirectory, state);
  await recordLocalCheck(runDirectory, state, gate);

  if (!gate.passed) {
    state.currentRole = accepted.role;
    await saveRunState(runDirectory, state);

    return { turn, repeatRole: true };
  }

  return { turn, repeatRole: false };
}

function handoff(state: RunState, from: Role, to: Role | null, turn: AgentTurn): Handoff {
  return {
    id: handoffId(state),
    sequence: state.messages.length,
    from,
    to,
    createdAt: new Date().toISOString(),
    turn,
  };
}

export async function persistTurnTransition(options: {
  runDirectory: string;
  state: RunState;
  role: Role;
  turn: AgentTurn;
}): Promise<boolean> {
  const { runDirectory, state, role, turn } = options;

  if (turn.decision === "complete") {
    const completion = handoff(state, role, null, turn);
    state.messages.push(completion);
    state.status = "completed";
    state.currentRole = null;
    state.finalSummary = turn.summary;
    await saveRunState(runDirectory, state);
    await recordHandoff(runDirectory, completion);

    return true;
  }

  if (turn.nextRole === null) {
    throw new Error("Validated handoff unexpectedly has no recipient.");
  }

  const message = handoff(state, role, turn.nextRole, turn);
  state.messages.push(message);
  state.currentRole = turn.nextRole;
  await saveRunState(runDirectory, state);
  await recordHandoff(runDirectory, message);

  return false;
}
