import { expect, test } from "bun:test";
import { RunTracer } from "../src/observability/run-tracer.ts";

test("tracer reports lifecycle, reasoning usage, and peak concurrency", async () => {
  const messages: string[] = [];
  let time = 0;
  const tracer = new RunTracer(
    (message) => messages.push(message),
    () => time,
  );

  const operation = async () => {
    time += 25;

    return {
      usage: {
        inputTokens: 10,
        outputTokens: 7,
        reasoningTokens: 3,
        totalTokens: 17,
      },
    };
  };

  await tracer.call(
    { label: "worker.monday", role: "worker", model: "cheap", effort: "low" },
    operation,
  );
  tracer.summary();

  expect(
    messages.some((message) => message.includes("worker.monday started")),
  ).toBeTrue();
  expect(messages.some((message) => message.includes("reasoning_tokens=3"))).toBeTrue();
  expect(messages).toContain("  peak concurrency:   1");
  expect(messages).toContain("  total tokens:       17");
});
