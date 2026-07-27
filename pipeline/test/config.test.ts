import { describe, expect, test } from "bun:test";
import { parseReasoningEffort } from "../src/config.ts";

describe("parseReasoningEffort", () => {
  test("accepts a supported reasoning effort", () => {
    expect(parseReasoningEffort("low")).toBe("low");
    expect(parseReasoningEffort("none")).toBe("none");
  });

  test("rejects unsupported values before making an API call", () => {
    expect(() => parseReasoningEffort("minimal")).toThrow(
      "Invalid OPENAI_REASONING_EFFORT",
    );
  });
});
