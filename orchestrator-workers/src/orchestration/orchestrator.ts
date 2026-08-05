import type { AppConfig } from "../config.ts";
import type { AgentRunner } from "../agents/contracts.ts";
import {
  assertContributionMatchesTask,
  assertPlanMatchesRequest,
  createDayTasks,
} from "../domain/contracts.ts";
import {
  finalPlanSchema,
  type DayContribution,
  type DayTask,
  type ExecutionPlan,
  type FinalPlan,
  type MealPlanRequest,
} from "../domain/schemas.ts";
import type { RunTracer } from "../observability/run-tracer.ts";
import { runWorkerPool } from "./worker-pool.ts";

async function executeWithRetry(
  runner: AgentRunner,
  tracer: RunTracer,
  config: AppConfig,
  task: DayTask,
): Promise<DayContribution> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.workerMaxAttempts; attempt += 1) {
    try {
      const result = await tracer.call(
        {
          label: `worker.${task.day.dayName.toLowerCase()}`,
          role: "worker",
          model: runner.models.worker,
          effort: config.workerReasoningEffort,
          attempt,
        },
        () => runner.execute(task),
      );
      assertContributionMatchesTask(task, result.value);

      return result.value;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function describeFailures(failures: Array<{ item: DayTask; error: unknown }>): string {
  return failures
    .map(({ item, error }) => {
      const message = error instanceof Error ? error.message : String(error);

      return `${item.day.dayName}: ${message}`;
    })
    .join("; ");
}

export async function createWeeklyPlan(
  runner: AgentRunner,
  tracer: RunTracer,
  config: AppConfig,
  request: MealPlanRequest,
): Promise<FinalPlan> {
  const planned = await tracer.call(
    {
      label: "orchestrator.plan",
      role: "orchestrator",
      model: runner.models.orchestrator,
      effort: config.orchestratorReasoningEffort,
    },
    () => runner.plan(request),
  );
  assertPlanMatchesRequest(request, planned.value);

  const executionPlan: ExecutionPlan = {
    menu: planned.value,
    tasks: createDayTasks(request, planned.value),
  };
  const pool = await runWorkerPool(
    executionPlan.tasks,
    config.workerConcurrency,
    (task) => executeWithRetry(runner, tracer, config, task),
  );

  if (pool.failures.length > 0) {
    throw new Error(
      `Workers exhausted their retries: ${describeFailures(pool.failures)}`,
    );
  }

  const contributions = pool.values.filter(
    (value): value is DayContribution => value !== undefined,
  );

  if (contributions.length !== executionPlan.tasks.length) {
    throw new Error("Worker pool completed without all expected contributions.");
  }

  const synthesized = await tracer.call(
    {
      label: "orchestrator.synthesize",
      role: "orchestrator",
      model: runner.models.orchestrator,
      effort: config.orchestratorReasoningEffort,
    },
    () => runner.synthesize(executionPlan.menu, contributions),
  );

  return finalPlanSchema.parse({
    menu: executionPlan.menu,
    recipes: contributions.flatMap((contribution) => contribution.recipes),
    shoppingList: synthesized.value.shoppingList,
  });
}
