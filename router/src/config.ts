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

export const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
export const REASONING_EFFORT = parseReasoningEffort();
export const ROUTER_CONFIDENCE_THRESHOLD = 0.65;
