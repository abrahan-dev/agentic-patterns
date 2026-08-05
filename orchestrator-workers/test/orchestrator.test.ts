import { describe, expect, test } from "bun:test";
import type { AgentResult } from "../src/agents/contracts.ts";
import type { AppConfig } from "../src/config.ts";
import { FakeAgentRunner } from "../src/demo/fake-agent-runner.ts";
import { demoRequest } from "../src/demo/request.ts";
import type {
  DayContribution,
  DayTask,
  PlannedMenu,
  ShoppingSynthesis,
} from "../src/domain/schemas.ts";
import { RunTracer } from "../src/observability/run-tracer.ts";
import { createWeeklyPlan } from "../src/orchestration/orchestrator.ts";

const config: AppConfig = {
  orchestratorModel: "fake-orchestrator",
  orchestratorReasoningEffort: "medium",
  workerModel: "fake-worker",
  workerReasoningEffort: "low",
  workerConcurrency: 3,
  workerMaxAttempts: 2,
};

class RecordingRunner extends FakeAgentRunner {
  readonly attempts = new Map<string, number>();
  synthesisCalls = 0;
  failFirstMonday = false;
  alwaysFailMonday = false;

  constructor() {
    super([0, 0, 0, 0, 0, 0, 0]);
  }

  override async execute(task: DayTask): Promise<AgentResult<DayContribution>> {
    const attempts = (this.attempts.get(task.id) ?? 0) + 1;
    this.attempts.set(task.id, attempts);

    if (
      task.day.dayName === "Monday" &&
      (this.alwaysFailMonday || (this.failFirstMonday && attempts === 1))
    ) {
      throw new Error("simulated worker failure");
    }

    return super.execute(task);
  }

  override synthesize(
    menu: PlannedMenu,
    contributions: DayContribution[],
  ): Promise<AgentResult<ShoppingSynthesis>> {
    this.synthesisCalls += 1;

    return super.synthesize(menu, contributions);
  }
}

describe("orchestration", () => {
  test("fans out recipes, keeps weekly order, and synthesizes once", async () => {
    const runner = new RecordingRunner();
    const tracer = new RunTracer(() => {});
    const result = await createWeeklyPlan(runner, tracer, config, demoRequest);

    expect(result.menu.days).toHaveLength(7);
    expect(result.recipes).toHaveLength(14);
    expect(result.recipes[0]?.date).toBe(result.menu.days[0]?.date);
    expect(result.recipes.at(-1)?.date).toBe(result.menu.days[6]?.date);
    expect(runner.synthesisCalls).toBe(1);
  });

  test("retries only the failed day", async () => {
    const runner = new RecordingRunner();
    runner.failFirstMonday = true;
    const tracer = new RunTracer(() => {});
    await createWeeklyPlan(runner, tracer, config, demoRequest);

    expect([...runner.attempts.values()].reduce((sum, value) => sum + value, 0)).toBe(8);
    expect(
      [...runner.attempts.values()].filter((attempts) => attempts === 2),
    ).toHaveLength(1);
    expect(runner.synthesisCalls).toBe(1);
  });

  test("does not synthesize when a worker exhausts retries", async () => {
    const runner = new RecordingRunner();
    runner.alwaysFailMonday = true;
    const tracer = new RunTracer(() => {});

    expect(createWeeklyPlan(runner, tracer, config, demoRequest)).rejects.toThrow(
      "Workers exhausted their retries",
    );
    expect(runner.synthesisCalls).toBe(0);
  });
});
