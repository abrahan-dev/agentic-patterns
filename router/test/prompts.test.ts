import { describe, expect, test } from "bun:test";
import { cuisineRoutingInput, nutritionRoutingInput } from "../src/pipeline/prompts.ts";

describe("routing inputs", () => {
  test("routes only the user's raw stage-2 answer", () => {
    const paymentMessage =
      "I have a problem with the last payment, I did not get the discount";

    expect(nutritionRoutingInput({ message: paymentMessage })).toBe(paymentMessage);
  });

  test("provides general nutrition intent for an empty stage-2 answer", () => {
    expect(nutritionRoutingInput({ message: "" })).toContain(
      "no special dietary requirements",
    );
  });

  test("routes only the raw cuisine preference", () => {
    expect(cuisineRoutingInput("I would like Asian food")).toBe(
      "I would like Asian food",
    );
  });

  test("uses the general cook for an empty cuisine preference", () => {
    expect(cuisineRoutingInput(" ")).toContain("general cooking style");
  });
});
