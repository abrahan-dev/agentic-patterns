import { isAbsolute, relative } from "node:path";
import type { AgentRunResult, AgentRunner } from "../agents/contracts.ts";
import {
  agentTurnSchema,
  type AgentTurn,
  type ChangePlan,
  type Role,
  type RunState,
} from "../domain/schemas.ts";
import { firstImplementationRole, nextImplementationRole } from "../domain/workflow.ts";

const codeWritingRoles = ["data-engineer", "backend-coder", "frontend-coder"] as const;
export type CodeWritingRole = (typeof codeWritingRoles)[number];

export function isCodeWritingRole(role: Role): role is CodeWritingRole {
  return codeWritingRoles.includes(role as CodeWritingRole);
}

export function isAgentRunResult(
  result: Awaited<ReturnType<AgentRunner["run"]>>,
): result is AgentRunResult {
  return "turn" in result;
}

export function normalizeChangedFiles(paths: string[], workspace: string): string[] {
  return [
    ...new Set(
      paths
        .map((path) => (isAbsolute(path) ? relative(workspace, path) : path))
        .filter((path) => path !== ".." && !path.startsWith("../")),
    ),
  ];
}

export function latestChangePlan(
  state: RunState,
  turn: AgentTurn,
): ChangePlan | undefined {
  if (turn.role === "architect") {
    return turn.changePlan;
  }

  const architect = state.messages.findLast(
    (message) => message.turn?.role === "architect",
  )?.turn;

  return architect?.role === "architect" ? architect.changePlan : undefined;
}

export function canonicalizeNextRole(state: RunState, turn: AgentTurn): AgentTurn {
  if (turn.role === "architect" && turn.nextRole !== "specifier") {
    return agentTurnSchema.parse({
      ...turn,
      nextRole: firstImplementationRole(turn.changePlan),
    });
  }

  if (
    ["ui-designer", ...codeWritingRoles].includes(
      turn.role as "ui-designer" | CodeWritingRole,
    ) &&
    turn.nextRole !== "architect"
  ) {
    const plan = latestChangePlan(state, turn);

    return plan
      ? agentTurnSchema.parse({
          ...turn,
          nextRole: nextImplementationRole(turn.role, plan),
        })
      : turn;
  }

  if (turn.role === "qa" && turn.decision === "handoff" && turn.failureOwner) {
    return agentTurnSchema.parse({ ...turn, nextRole: turn.failureOwner });
  }

  return turn;
}

export function enrichWithObservedEvidence(
  turn: AgentTurn,
  result: AgentRunResult | null,
  workspace: string,
): AgentTurn {
  const observations = result?.observations;

  if (!observations) {
    return turn;
  }

  const changedFiles = normalizeChangedFiles(observations.changedFiles, workspace);
  const commandEvidence = observations.commands.map(
    ({ command, exitCode }) => `${command}: exit ${exitCode ?? "unknown"}`,
  );

  if (isCodeWritingRole(turn.role)) {
    return {
      ...turn,
      artifacts: [...new Set([...turn.artifacts, ...changedFiles])],
      evidence: [...new Set([...turn.evidence, ...commandEvidence])],
    };
  }

  if (turn.role === "qa") {
    return {
      ...turn,
      commands: [
        ...new Set([
          ...turn.commands,
          ...observations.commands.map(({ command }) => command),
        ]),
      ],
      evidence: [...new Set([...turn.evidence, ...commandEvidence])],
    };
  }

  return turn;
}
