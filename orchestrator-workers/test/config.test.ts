import { expect, test } from "bun:test";
import { loadConfig } from "../src/config.ts";

test("configuration keeps orchestrator and worker model roles separate", () => {
  const config = loadConfig({
    OPENAI_ORCHESTRATOR_MODEL: "strong",
    OPENAI_WORKER_MODEL: "cheap",
    WORKER_CONCURRENCY: "4",
    WORKER_MAX_ATTEMPTS: "3",
  });

  expect(config.orchestratorModel).toBe("strong");
  expect(config.workerModel).toBe("cheap");
  expect(config.workerConcurrency).toBe(4);
  expect(config.workerMaxAttempts).toBe(3);
});

test("configuration rejects invalid concurrency", () => {
  expect(() => loadConfig({ WORKER_CONCURRENCY: "0" })).toThrow(
    "WORKER_CONCURRENCY must be a positive integer",
  );
});
