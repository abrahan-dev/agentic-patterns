import type { AgentRunner } from "../agents/contracts.ts";
import type { RunState } from "../domain/schemas.ts";
import { RunStatus } from "../domain/workflow-values.ts";
import {
  DeterministicWorkspaceBootstrapper,
  type WorkspaceBootstrapper,
} from "../local/workspace-bootstrapper.ts";
import type { SpecificationJournal } from "../specifications/specification-journal.ts";
import { loadRunState } from "./run-store.ts";
import type { SpecificationReviewer } from "./specification-reviewer.ts";
import {
  emptyAttemptState,
  executeAgentTurn,
  recordFailedAttempt,
} from "./turn-execution.ts";
import {
  persistTurnTransition,
  processBootstrapPhase,
  processQualityPhase,
  processSpecificationPhase,
} from "./turn-phases.ts";

function assertTurnBudget(state: RunState): void {
  if (state.turns >= state.maxTurns) {
    throw new Error(`Maximum turn count (${state.maxTurns}) reached.`);
  }
}

export async function runDevelopmentTeam(
  runner: AgentRunner,
  runDirectory: string,
  specificationReviewer: SpecificationReviewer,
  specificationJournal: SpecificationJournal,
  workspaceBootstrapper: WorkspaceBootstrapper = new DeterministicWorkspaceBootstrapper(),
): Promise<RunState> {
  const state = await loadRunState(runDirectory);
  const attempt = emptyAttemptState(state.currentRole);

  try {
    while (state.status === RunStatus.Running) {
      assertTurnBudget(state);
      const accepted = await executeAgentTurn({
        runner,
        runDirectory,
        state,
        journal: specificationJournal,
        attempt,
      });
      const specificationPhase = await processSpecificationPhase({
        accepted,
        runDirectory,
        state,
        reviewer: specificationReviewer,
        journal: specificationJournal,
      });

      if (specificationPhase.repeatRole) {
        continue;
      }

      await processBootstrapPhase({
        turn: specificationPhase.turn,
        runDirectory,
        state,
        bootstrapper: workspaceBootstrapper,
      });
      const qualityPhase = await processQualityPhase({
        accepted,
        turn: specificationPhase.turn,
        runDirectory,
        state,
      });

      if (qualityPhase.repeatRole) {
        continue;
      }

      if (
        await persistTurnTransition({
          runDirectory,
          state,
          role: accepted.role,
          turn: qualityPhase.turn,
        })
      ) {
        return state;
      }
    }
  } catch (error) {
    await recordFailedAttempt(runDirectory, state, attempt, error);
    throw error;
  }

  return state;
}
