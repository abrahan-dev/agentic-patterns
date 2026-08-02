import { describe, expect, test } from "bun:test";
import { parseReasoningEffort, parseRouterConfidenceThreshold } from "../src/config.ts";

describe("parseReasoningEffort", () => {
  test("accepts supported values", () => {
    expect(parseReasoningEffort("low")).toBe("low");
    expect(parseReasoningEffort("xhigh")).toBe("xhigh");
  });

  test("rejects unsupported values", () => {
    expect(() => parseReasoningEffort("minimal")).toThrow(
      "Invalid OPENAI_REASONING_EFFORT",
    );
  });
});

describe("parseRouterConfidenceThreshold", () => {
  test("accepts the inclusive zero-to-one range", () => {
    expect(parseRouterConfidenceThreshold("0")).toBe(0);
    expect(parseRouterConfidenceThreshold("0.65")).toBe(0.65);
    expect(parseRouterConfidenceThreshold("1")).toBe(1);
  });

  test("rejects invalid and out-of-range values", () => {
    expect(() => parseRouterConfidenceThreshold("")).toThrow(
      "Invalid ROUTER_CONFIDENCE_THRESHOLD",
    );
    expect(() => parseRouterConfidenceThreshold("high")).toThrow(
      "Invalid ROUTER_CONFIDENCE_THRESHOLD",
    );
    expect(() => parseRouterConfidenceThreshold("-0.1")).toThrow(
      "Invalid ROUTER_CONFIDENCE_THRESHOLD",
    );
    expect(() => parseRouterConfidenceThreshold("1.1")).toThrow(
      "Invalid ROUTER_CONFIDENCE_THRESHOLD",
    );
  });
});
