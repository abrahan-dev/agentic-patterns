const reasoningEfforts = ["none", "low", "medium", "high", "xhigh"] as const;

export type ReasoningEffort = (typeof reasoningEfforts)[number];

export function parseReasoningEffort(
  value = process.env.OPENAI_REASONING_EFFORT ?? "low",
): ReasoningEffort {
  if (reasoningEfforts.some((effort) => effort === value)) {
    return value as ReasoningEffort;
  }

  throw new Error(
    `Invalid OPENAI_REASONING_EFFORT "${value}". Expected one of: ${reasoningEfforts.join(", ")}.`,
  );
}

export function parseRouterConfidenceThreshold(
  value = process.env.ROUTER_CONFIDENCE_THRESHOLD ?? "0.65",
): number {
  const threshold = Number(value);

  if (
    value.trim() === "" ||
    !Number.isFinite(threshold) ||
    threshold < 0 ||
    threshold > 1
  ) {
    throw new Error(
      `Invalid ROUTER_CONFIDENCE_THRESHOLD "${value}". Expected a number from 0 to 1.`,
    );
  }

  return threshold;
}

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
export const REASONING_EFFORT = parseReasoningEffort();
export const ROUTER_CONFIDENCE_THRESHOLD = parseRouterConfidenceThreshold();
