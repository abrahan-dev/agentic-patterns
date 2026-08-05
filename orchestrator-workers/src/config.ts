import type { ReasoningEffort } from "openai/resources/shared";

const supportedEfforts = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function parseReasoningEffort(
  value: string | undefined,
  fallback: Exclude<ReasoningEffort, null>,
  name: string,
): Exclude<ReasoningEffort, null> {
  const selected = value ?? fallback;

  if (supportedEfforts.some((effort) => effort === selected)) {
    return selected as Exclude<ReasoningEffort, null>;
  }

  throw new Error(`${name} must be one of: ${supportedEfforts.join(", ")}.`);
}

export interface AppConfig {
  orchestratorModel: string;
  orchestratorReasoningEffort: Exclude<ReasoningEffort, null>;
  workerModel: string;
  workerReasoningEffort: Exclude<ReasoningEffort, null>;
  workerConcurrency: number;
  workerMaxAttempts: number;
}

export function loadConfig(environment = process.env): AppConfig {
  return {
    orchestratorModel: environment.OPENAI_ORCHESTRATOR_MODEL ?? "gpt-5.6-sol",
    orchestratorReasoningEffort: parseReasoningEffort(
      environment.OPENAI_ORCHESTRATOR_REASONING_EFFORT,
      "medium",
      "OPENAI_ORCHESTRATOR_REASONING_EFFORT",
    ),
    workerModel: environment.OPENAI_WORKER_MODEL ?? "gpt-5.6-terra",
    workerReasoningEffort: parseReasoningEffort(
      environment.OPENAI_WORKER_REASONING_EFFORT,
      "low",
      "OPENAI_WORKER_REASONING_EFFORT",
    ),
    workerConcurrency: parsePositiveInteger(
      environment.WORKER_CONCURRENCY,
      3,
      "WORKER_CONCURRENCY",
    ),
    workerMaxAttempts: parsePositiveInteger(
      environment.WORKER_MAX_ATTEMPTS,
      2,
      "WORKER_MAX_ATTEMPTS",
    ),
  };
}
