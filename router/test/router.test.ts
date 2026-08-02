import { describe, expect, test } from "bun:test";
import { nutritionAgents } from "../src/agents/catalog.ts";
import { applyConfidenceThreshold, applyRoutingPolicy } from "../src/router/router.ts";

describe("router confidence policy", () => {
  test("keeps a specialist decision above the threshold", () => {
    const route = applyConfidenceThreshold({
      destination: "nutritionist",
      confidence: 0.91,
      reason: "The request asks for balanced dishes.",
    });

    expect(route.agent.id).toBe("nutritionist");
    expect(route.thresholdApplied).toBe(false);
  });

  test("keeps the plant-based specialist selected for vegan preferences", () => {
    const route = applyConfidenceThreshold({
      destination: "plant_based_nutritionist",
      confidence: 0.97,
      reason: "The user explicitly requests a vegan menu.",
    });

    expect(route.agent.id).toBe("plant_based_nutritionist");
    expect(route.agent.name).toBe("Vegan and vegetarian nutritionist");
    expect(route.thresholdApplied).toBe(false);
  });

  test("forces fallback when specialist confidence is too low", () => {
    const route = applyConfidenceThreshold({
      destination: "mediterranean_cook",
      confidence: 0.42,
      reason: "The intent is ambiguous.",
    });

    expect(route.agent.id).toBe("fallback");
    expect(route.thresholdApplied).toBe(true);
  });

  test("preserves an explicit fallback decision", () => {
    const route = applyConfidenceThreshold({
      destination: "fallback",
      confidence: 0.98,
      reason: "The request is about accounting.",
    });

    expect(route.agent.id).toBe("fallback");
    expect(route.thresholdApplied).toBe(false);
  });

  test("falls back when a destination is unavailable in the current stage", () => {
    const route = applyRoutingPolicy(
      {
        destination: "asian_cook",
        confidence: 0.99,
        reason: "The answer mentions Asian food.",
      },
      nutritionAgents,
    );

    expect(route.agent.id).toBe("fallback");
    expect(route.availabilityOverride).toBe(true);
  });
});
