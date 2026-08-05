import { describe, expect, test } from "bun:test";
import { assertPlanMatchesRequest, createDayTasks } from "../src/domain/contracts.ts";
import { FakeAgentRunner } from "../src/demo/fake-agent-runner.ts";
import { demoRequest } from "../src/demo/request.ts";

describe("planner contracts", () => {
  test("derives one immutable task per planned day", async () => {
    const runner = new FakeAgentRunner([]);
    const { value: menu } = await runner.plan(demoRequest);

    expect(() => assertPlanMatchesRequest(demoRequest, menu)).not.toThrow();
    const tasks = createDayTasks(demoRequest, menu);

    expect(tasks).toHaveLength(7);
    expect(tasks[0]?.day).toEqual(menu.days[0]);
    expect(tasks[6]?.id).toBe(`day-7-${menu.days[6]?.date}`);
  });

  test("rejects duplicate dishes before workers launch", async () => {
    const runner = new FakeAgentRunner([]);
    const { value: menu } = await runner.plan(demoRequest);
    menu.days[1]!.meals[0]!.dish = menu.days[0]!.meals[0]!.dish.toUpperCase();

    expect(() => assertPlanMatchesRequest(demoRequest, menu)).toThrow(
      "duplicate dish detected",
    );
  });
});
