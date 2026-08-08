import { expect, test } from "bun:test";
import { TerminalSpecificationReviewer } from "../../src/cli/terminal-specification-reviewer.ts";
import type { RunState } from "../../src/domain/schemas.ts";
import { emptyTokenTotals } from "../../src/domain/token-usage.ts";
import type { CommandRunner } from "../../src/ui/tmux.ts";

const specification = {
  role: "specifier" as const,
  featureId: "validate-input",
  summary: "Accept valid input and reject invalid input.",
  specification:
    "Feature: Validate input\n\n  Scenario: Reject invalid input\n    Given invalid input\n    When validation runs\n    Then a validation error is returned",
  assumptions: [],
  outOfScope: [],
  artifacts: [],
  evidence: ["Given invalid input, the operation returns a validation error."],
  decision: "handoff" as const,
  nextRole: "architect" as const,
  reason: "The behavior is ready for architectural review.",
};

const state = {
  prompt: "Build validation",
  turns: 1,
  maxTurns: 12,
  tokenTotals: emptyTokenTotals(),
} as RunState;

test("human approval switches to the review window and back", async () => {
  const commands: string[][] = [];
  const runner: CommandRunner = {
    run(command) {
      commands.push(command);

      return Promise.resolve();
    },
  };
  const reviewer = new TerminalSpecificationReviewer(runner, "dev-team-test", () =>
    Promise.resolve("a"),
  );

  expect(await reviewer.review({ state, specification })).toEqual({
    decision: "approved",
    feedback: null,
  });
  expect(commands).toEqual([
    ["tmux", "select-window", "-t", "dev-team-test:orchestrator"],
    ["tmux", "select-window", "-t", "dev-team-test:agents"],
  ]);
});

test("human feedback requests another specifier turn", async () => {
  const answers = ["c", "Include the empty-input case."];
  const reviewer = new TerminalSpecificationReviewer(
    { run: () => Promise.resolve() },
    undefined,
    () => Promise.resolve(answers.shift() ?? ""),
  );

  expect(await reviewer.review({ state, specification })).toEqual({
    decision: "changes_requested",
    feedback: "Include the empty-input case.",
  });
});
