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
