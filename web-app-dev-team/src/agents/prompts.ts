import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { AgentContext } from "./contracts.ts";
import type { AgentTurn, Handoff, Role, SpecificationReview } from "../domain/schemas.ts";
import { transitionDescription } from "../domain/workflow.ts";
import {
  describeWorkspaceFacts,
  loadWorkspaceFacts,
} from "../local/workspace-inspector.ts";

export function roleInstructionsPath(role: Role): string {
  return resolve(import.meta.dir, "../../roles", `${role}.md`);
}

export function loadRoleInstructions(role: Role): Promise<string> {
  return readFile(roleInstructionsPath(role), "utf8");
}

function list(values: string[], separator = "; "): string {
  return values.join(separator) || "none";
}

function describeSpecifier(turn: Extract<AgentTurn, { role: "specifier" }>): string {
  return [
    `Specification:\n${turn.specification}`,
    `Assumptions: ${list(turn.assumptions)}`,
    `Out of scope: ${list(turn.outOfScope)}`,
  ].join("\n");
}

function describeArchitect(turn: Extract<AgentTurn, { role: "architect" }>): string {
  return [
    `Design:\n${turn.design}`,
    `Application: ${turn.changePlan.applicationName}`,
    `Contexts: ${list(turn.changePlan.contexts, ", ")}`,
    `Required surfaces: data=${turn.changePlan.dataRequired}, backend=${turn.changePlan.backendRequired}, frontend=${turn.changePlan.frontendRequired}`,
    `Domain model: ${list(turn.domainModel)}`,
    `API contract: ${list(turn.apiContract)}`,
    `Security: ${list(turn.security)}`,
    `Constraints: ${list(turn.constraints)}`,
    `Risks: ${list(turn.risks)}`,
  ].join("\n");
}

function describeUiDesigner(turn: Extract<AgentTurn, { role: "ui-designer" }>): string {
  return [
    `Screens: ${list(turn.screens)}`,
    `Interactions: ${list(turn.interactions)}`,
    `States: ${list(turn.interfaceStates)}`,
    `Accessibility: ${list(turn.accessibility)}`,
  ].join("\n");
}

function describeDataEngineer(
  turn: Extract<AgentTurn, { role: "data-engineer" }>,
): string {
  return [
    `Schema changes: ${list(turn.schemaChanges)}`,
    `Migrations: ${list(turn.migrations)}`,
    `Mappings: ${list(turn.persistenceMappings)}`,
    `Tests: ${list(turn.tests)}`,
  ].join("\n");
}

function describeBackendCoder(
  turn: Extract<AgentTurn, { role: "backend-coder" }>,
): string {
  return [
    `Changes: ${list(turn.changes)}`,
    `Tests: ${list(turn.tests)}`,
    `API procedures: ${list(turn.apiProcedures)}`,
    `Domain decisions: ${list(turn.domainDecisions)}`,
  ].join("\n");
}

function describeFrontendCoder(
  turn: Extract<AgentTurn, { role: "frontend-coder" }>,
): string {
  return [
    `Changes: ${list(turn.changes)}`,
    `Tests: ${list(turn.tests)}`,
    `Screens: ${list(turn.screens)}`,
    `API usage: ${list(turn.apiUsage)}`,
  ].join("\n");
}

function describeQa(turn: Extract<AgentTurn, { role: "qa" }>): string {
  return [
    `Scenarios tested: ${list(turn.scenariosTested)}`,
    `Commands: ${list(turn.commands)}`,
    `Failures: ${list(turn.failures)}`,
  ].join("\n");
}

function describeDeliverable(message: Handoff): string {
  switch (message.turn?.role) {
    case "specifier":
      return describeSpecifier(message.turn);
    case "architect":
      return describeArchitect(message.turn);
    case "ui-designer":
      return describeUiDesigner(message.turn);
    case "data-engineer":
      return describeDataEngineer(message.turn);
    case "backend-coder":
      return describeBackendCoder(message.turn);
    case "frontend-coder":
      return describeFrontendCoder(message.turn);
    case "qa":
      return describeQa(message.turn);
    default:
      return "";
  }
}

function describeHandoff(message: Handoff): string {
  if (message.turn === null) {
    return `#${message.sequence} user -> ${message.to}`;
  }

  return [
    `#${message.sequence} ${message.from} -> ${message.to ?? "complete"}`,
    `Summary: ${message.turn.summary}`,
    describeDeliverable(message),
    `Artifacts: ${message.turn.artifacts.join(", ") || "none"}`,
    `Evidence: ${message.turn.evidence.join("; ") || "none"}`,
    `Reason: ${message.turn.reason}`,
  ].join("\n");
}

function describeSpecificationReview(review: SpecificationReview): string {
  return [
    `Feature ID: ${review.specification.featureId}`,
    `Specification:\n${review.specification.specification}`,
    `Assumptions: ${review.specification.assumptions.join("; ") || "none"}`,
    `Out of scope: ${review.specification.outOfScope.join("; ") || "none"}`,
    `Human decision: ${review.decision}`,
    `Human feedback: ${review.feedback ?? "none"}`,
    `Published artifact: ${review.publishedSpecification?.path ?? "none"}`,
  ].join("\n");
}

function latestHandoffFrom(
  state: AgentContext["state"],
  role: Role,
): Handoff | undefined {
  return state.messages.findLast((message) => message.turn?.role === role);
}

function relevantHandoffs(context: AgentContext): Handoff[] {
  const { role, state } = context;
  const latestAddressedToRole = state.messages.findLast((message) => message.to === role);
  const candidates =
    role === "specifier"
      ? [latestHandoffFrom(state, "architect")]
      : role === "architect"
        ? [latestHandoffFrom(state, "specifier"), latestAddressedToRole]
        : role === "ui-designer"
          ? [latestHandoffFrom(state, "architect"), latestHandoffFrom(state, "qa")]
          : role === "data-engineer"
            ? [
                latestHandoffFrom(state, "architect"),
                latestHandoffFrom(state, "ui-designer"),
                latestHandoffFrom(state, "qa"),
              ]
            : role === "backend-coder"
              ? [
                  latestHandoffFrom(state, "architect"),
                  latestHandoffFrom(state, "ui-designer"),
                  latestHandoffFrom(state, "data-engineer"),
                  latestHandoffFrom(state, "qa"),
                ]
              : role === "frontend-coder"
                ? [
                    latestHandoffFrom(state, "architect"),
                    latestHandoffFrom(state, "ui-designer"),
                    latestHandoffFrom(state, "backend-coder"),
                    latestHandoffFrom(state, "qa"),
                  ]
                : [
                    latestHandoffFrom(state, "data-engineer"),
                    latestHandoffFrom(state, "backend-coder"),
                    latestHandoffFrom(state, "frontend-coder"),
                  ];

  return candidates.filter(
    (message, index, all): message is Handoff =>
      message !== undefined && all.findIndex((item) => item?.id === message.id) === index,
  );
}

function relevantReview(context: AgentContext): string {
  const decision = context.role === "specifier" ? "changes_requested" : "approved";
  const review = context.state.specificationReviews.findLast(
    (candidate) => candidate.decision === decision,
  );

  return review ? describeSpecificationReview(review) : "none";
}

function approvedArtifact(state: AgentContext["state"]): string {
  const specification =
    state.targetSpecification ??
    state.specificationReviews.findLast((review) => review.decision === "approved")
      ?.publishedSpecification;

  return specification
    ? `${specification.path}\nSHA-256: ${specification.sha256}\nSequence: ${specification.sequence}`
    : "none";
}

function interruptionSummary(context: AgentContext): string {
  return (
    context.state.interruptions
      .filter((interruption) => interruption.role === context.role)
      .slice(-1)
      .map(
        (interruption) =>
          `#${interruption.sequence} ${interruption.role} turn ${interruption.turn}: ${interruption.reason}\nLog: ${interruption.logPath}`,
      )
      .join("\n\n") || "none"
  );
}

function localFeedbackSummary(context: AgentContext): string {
  return (
    context.state.localChecks
      .filter((check) => check.role === context.role && !check.passed)
      .slice(-1)
      .map(
        (check) =>
          `${check.kind}: ${check.summary}\n${check.details.map((detail) => `- ${detail}`).join("\n")}`,
      )
      .join("\n") || "none"
  );
}

function bootstrapSummary(state: AgentContext["state"]): string {
  const bootstrap = state.workspaceBootstrap;

  return bootstrap
    ? `${bootstrap.status}: ${bootstrap.reason}\nTemplate: ${bootstrap.template} v${bootstrap.templateVersion}\nCreated files: ${list(bootstrap.createdFiles, ", ")}\nCommands: ${list(
        bootstrap.commands.map(
          ({ command, exitCode }) => `${command} (exit ${exitCode})`,
        ),
        ", ",
      )}`
    : "not evaluated yet";
}

function restitutionRules(state: AgentContext["state"]): string {
  return state.mode === "restitution"
    ? `\nRestitution rules:\n- Implement only specification sequence ${state.targetSpecification?.sequence}.\n- Later specification files may exist, but must not influence this sequence.\n- The specification is already human-approved and immutable; never hand off to the specifier.\n- QA completion commits the restitution checkpoint and permits the next sequence to start.\n`
    : "";
}

export async function buildAgentPrompt(context: AgentContext): Promise<string> {
  const { role, state } = context;
  const roleInstructions = await loadRoleInstructions(role);
  const facts = await loadWorkspaceFacts(state.workspace, context.runDirectory);
  const history = relevantHandoffs(context).map(describeHandoff).join("\n\n") || "none";

  return `You are the ${role} in a specialized enterprise web application development team.

Task from the user:
${state.prompt}

Workspace:
${state.workspace}

Deterministic workspace inventory:
${describeWorkspaceFacts(facts)}

Deterministic workspace bootstrap:
${bootstrapSummary(state)}

Your responsibility:
${roleInstructions}

Deterministic workflow (no other transition is legal):
${transitionDescription(state.mode)}
${restitutionRules(state)}

Role-relevant handoffs (the complete durable history remains in ${context.runDirectory}/state.json):
${history}

Latest relevant human specification review:
${relevantReview(context)}

Latest approved specification artifact:
${approvedArtifact(state)}

Previous interrupted attempts:
${interruptionSummary(context)}

Latest failed local check for this role:
${localFeedbackSummary(context)}

Rules:
- Work on the task now using the tools available in this workspace.
- The fixed product stack is TypeScript 7, Bun, tRPC, Zod, Drizzle ORM with bun:sqlite, React and Playwright.
- Domain and application code lives under src/contexts; deployable applications live under src/apps/<application-name>/backend or frontend.
- Treat prior summaries as context, but verify claims from files and commands.
- After an interrupted attempt, inspect the current workspace and cited log before deciding what remains; partial edits may already exist.
- Keep the scope to one cohesive feature slice.
- Never claim a command passed unless you ran it and saw it pass.
- The final response must match the supplied JSON schema.
- Populate every role-specific deliverable field with concrete, reviewable content.
- When an approved specification artifact is present, read that workspace file and treat it as the authoritative functional contract.
- decision=handoff requires a legal nextRole.
- decision=complete is legal only for QA and requires nextRole=null.
- artifacts are workspace-relative paths you created, changed, or reviewed.
- evidence contains concise commands, test results, or observable facts.
`;
}
