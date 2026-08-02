import { describe, expect, test } from "bun:test";
import {
  parseIsoDateInput,
  parseRecipeDetailInput,
  parseYesNoInput,
} from "../src/cli/questions.ts";

describe("stage 1 input validation", () => {
  test("accepts real ISO dates and the empty default", () => {
    expect(parseIsoDateInput("2026-08-10", "2026-08-02")).toBe("2026-08-10");
    expect(parseIsoDateInput("", "2026-08-02")).toBe("2026-08-02");
  });

  test("rejects malformed and impossible dates", () => {
    expect(parseIsoDateInput("next Monday", "2026-08-02")).toBeUndefined();
    expect(parseIsoDateInput("2026-02-30", "2026-08-02")).toBeUndefined();
  });

  test("accepts only explicit yes/no answers or the default", () => {
    expect(parseYesNoInput("yes", false)).toBe(true);
    expect(parseYesNoInput("n", true)).toBe(false);
    expect(parseYesNoInput("", true)).toBe(true);
    expect(parseYesNoInput("maybe", false)).toBeUndefined();
  });

  test("accepts only exact recipe-detail choices", () => {
    expect(parseRecipeDetailInput("")).toBe("concise");
    expect(parseRecipeDetailInput("concise")).toBe("concise");
    expect(parseRecipeDetailInput("detailed")).toBe("detailed");
    expect(
      parseRecipeDetailInput("detail, yet schematic and get to the point"),
    ).toBeUndefined();
  });
});
