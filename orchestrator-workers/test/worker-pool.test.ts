import { expect, test } from "bun:test";
import { runWorkerPool } from "../src/orchestration/worker-pool.ts";

test("worker pool respects the concurrency cap and preserves result order", async () => {
  let active = 0;
  let peak = 0;
  const result = await runWorkerPool([40, 5, 25, 10, 15], 2, async (delay) => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise((resolve) => setTimeout(resolve, delay));
    active -= 1;

    return delay * 2;
  });

  expect(peak).toBe(2);
  expect(result.failures).toEqual([]);
  expect(result.values).toEqual([80, 10, 50, 20, 30]);
});
