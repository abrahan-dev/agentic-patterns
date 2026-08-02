import { describe, expect, test } from "bun:test";
import { parseReasoningEffort } from "../src/config.ts";

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
