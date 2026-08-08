import { describe, expect, test } from "bun:test";
import type { ChangePlan, Role } from "../../src/domain/schemas.ts";
import {
  firstImplementationRole,
  nextImplementationRole,
  validateTransition,
} from "../../src/domain/workflow.ts";

const fullStack: ChangePlan = {
  applicationName: "operations",
  contexts: ["orders"],
  dataRequired: true,
  backendRequired: true,
  frontendRequired: true,
};

function turn(
  nextRole: Role | null,
  decision: "handoff" | "complete" = "handoff",
  failureOwner: Role | null = null,
) {
  return {
    decision,
    nextRole,
    failureOwner,
    failures: decision === "handoff" && failureOwner ? ["observable failure"] : [],
  };
}

describe("deterministic specialized workflow", () => {
  test("derives conditional implementation stages from the architect plan", () => {
    expect(firstImplementationRole(fullStack)).toBe("ui-designer");
    expect(nextImplementationRole("ui-designer", fullStack)).toBe("data-engineer");
    expect(nextImplementationRole("data-engineer", fullStack)).toBe("backend-coder");
    expect(nextImplementationRole("backend-coder", fullStack)).toBe("frontend-coder");
    expect(nextImplementationRole("frontend-coder", fullStack)).toBe("qa");

    expect(
      firstImplementationRole({
        ...fullStack,
        dataRequired: false,
        frontendRequired: false,
      }),
    ).toBe("backend-coder");
  });

  test("accepts the planned path, architect escalation and owned QA feedback", () => {
    expect(() => validateTransition("specifier", turn("architect"))).not.toThrow();
    expect(() =>
      validateTransition("architect", turn("ui-designer"), "delivery", fullStack),
    ).not.toThrow();
    expect(() =>
      validateTransition("ui-designer", turn("data-engineer"), "delivery", fullStack),
    ).not.toThrow();
    expect(() =>
      validateTransition("data-engineer", turn("backend-coder"), "delivery", fullStack),
    ).not.toThrow();
    expect(() =>
      validateTransition("backend-coder", turn("frontend-coder"), "delivery", fullStack),
    ).not.toThrow();
    expect(() =>
      validateTransition("frontend-coder", turn("architect"), "delivery", fullStack),
    ).not.toThrow();
    expect(() =>
      validateTransition("qa", turn("frontend-coder", "handoff", "frontend-coder")),
    ).not.toThrow();
    expect(() => validateTransition("qa", turn(null, "complete"))).not.toThrow();
  });

  test("rejects skipped stages, premature completion and mismatched QA ownership", () => {
    expect(() =>
      validateTransition("architect", turn("backend-coder"), "delivery", fullStack),
    ).toThrow("must hand off to ui-designer");
    expect(() => validateTransition("backend-coder", turn(null, "complete"))).toThrow(
      "Only QA may complete",
    );
    expect(() =>
      validateTransition("qa", turn("backend-coder", "handoff", "frontend-coder")),
    ).toThrow("failureOwner");
  });
});

test("restitution cannot return an approved specification to the specifier", () => {
  expect(() =>
    validateTransition(
      "architect",
      { decision: "handoff", nextRole: "specifier" },
      "restitution",
      fullStack,
    ),
  ).toThrow("approved specification cannot return to the specifier");
});
