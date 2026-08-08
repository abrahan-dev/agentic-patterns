import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type { AgentContext, AgentRunner } from "../../src/agents/contracts.ts";
import { ScriptedAgentRunner } from "../../src/demo/scripted-agent-runner.ts";
import type { AgentTurn } from "../../src/domain/schemas.ts";
import { runDevelopmentTeam } from "../../src/orchestration/orchestrator.ts";
import { createRunState, loadRunState } from "../../src/orchestration/run-store.ts";
import {
  AutomaticSpecificationReviewer,
  type SpecificationReviewer,
} from "../../src/orchestration/specification-reviewer.ts";
import { FileSpecificationJournal } from "../../src/specifications/specification-journal.ts";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function newRun(maxTurns = 12): Promise<string> {
  const root = await mkdtemp(resolve(tmpdir(), "web-app-dev-team-"));
  temporaryDirectories.push(root);
  await writeFile(resolve(root, "README.md"), "# Existing test project\n");
  const created = await createRunState({
    prompt: "Build a small feature",
    workspace: root,
    runsRoot: root,
    maxTurns,
  });

  return created.runDirectory;
}

describe("development team orchestration", () => {
  test("persists every handoff and completes only after QA", async () => {
    const directory = await newRun();
    const result = await runDevelopmentTeam(
      new ScriptedAgentRunner(),
      directory,
      new AutomaticSpecificationReviewer(),
      new FileSpecificationJournal(),
    );

    expect(result.status).toBe("completed");
    expect(result.turns).toBe(7);
    expect(result.messages.map(({ from, to }) => [from, to])).toEqual([
      ["user", "specifier"],
      ["specifier", "architect"],
      ["architect", "ui-designer"],
      ["ui-designer", "data-engineer"],
      ["data-engineer", "backend-coder"],
      ["backend-coder", "frontend-coder"],
      ["frontend-coder", "qa"],
      ["qa", null],
    ]);
    expect(result.specificationReviews).toHaveLength(1);
    expect(result.workspaceBootstrap).toMatchObject({
      status: "skipped",
      template: "enterprise-web-app",
      templateVersion: 1,
    });
    expect(result.specificationReviews[0]?.decision).toBe("approved");
    expect(result.specificationReviews[0]?.publishedSpecification?.path).toBe(
      "specifications/000001-deliver-a-generic-feature.feature",
    );
    expect((await loadRunState(directory)).finalSummary).toContain("passed");
  });

  test("persists token totals and renders readable loop and handoff information", async () => {
    const directory = await newRun();
    const scripted = new ScriptedAgentRunner();
    const runner: AgentRunner = {
      async run(context) {
        return {
          turn: await scripted.run(context),
          usage: {
            inputTokens: 100,
            cachedInputTokens: 40,
            outputTokens: 20,
            reasoningOutputTokens: 5,
            totalTokens: 120,
          },
        };
      },
    };
    const result = await runDevelopmentTeam(
      runner,
      directory,
      new AutomaticSpecificationReviewer(),
      new FileSpecificationJournal(),
    );

    expect(result.tokenTotals.team.totalTokens).toBe(840);
    expect(result.tokenTotals.byRole.architect.totalTokens).toBe(120);
    expect(result.executions).toHaveLength(7);
    const architectLog = await readFile(
      resolve(directory, "logs", "architect.log"),
      "utf8",
    );
    expect(architectLog).toContain("SPECIFIER → ARCHITECT");
    expect(architectLog).toContain("ARCHITECT → UI-DESIGNER");
    expect(architectLog).toContain("ARCHITECT WORKING");
    expect(architectLog).toContain("THIS AGENT 120");
    expect(architectLog).toContain("TEAM 840");
  });

  test("skips UI and data specialists for a backend-only change", async () => {
    const directory = await newRun();
    const scripted = new ScriptedAgentRunner();
    const visited: string[] = [];
    const runner: AgentRunner = {
      async run(context) {
        visited.push(context.role);
        const turn = await scripted.run(context);

        if (turn.role === "architect") {
          return {
            ...turn,
            changePlan: {
              ...turn.changePlan,
              dataRequired: false,
              frontendRequired: false,
            },
            nextRole: "qa",
          };
        }

        if (turn.role === "backend-coder") {
          return { ...turn, nextRole: "qa" };
        }

        return turn;
      },
    };

    const result = await runDevelopmentTeam(
      runner,
      directory,
      new AutomaticSpecificationReviewer(),
      new FileSpecificationJournal(),
    );

    expect(result.status).toBe("completed");
    expect(visited).toEqual(["specifier", "architect", "backend-coder", "qa"]);
  });

  test("fails closed when an agent invents a transition", async () => {
    const directory = await newRun();
    const invalidRunner: AgentRunner = {
      run: (): Promise<AgentTurn> =>
        Promise.resolve({
          role: "backend-coder",
          summary: "skip ahead",
          changes: [],
          tests: [],
          apiProcedures: [],
          domainDecisions: [],
          artifacts: [],
          evidence: [],
          decision: "handoff",
          nextRole: "qa",
          reason: "faster",
        }),
    };

    expect(
      runDevelopmentTeam(
        invalidRunner,
        directory,
        new AutomaticSpecificationReviewer(),
        new FileSpecificationJournal(),
      ),
    ).rejects.toThrow("specifier returned a backend-coder turn");
    expect((await loadRunState(directory)).status).toBe("failed");
  });

  test("stops feedback loops at the configured turn budget", async () => {
    const directory = await newRun(2);
    const loopRunner: AgentRunner = {
      run: ({ role }: AgentContext): Promise<AgentTurn> => {
        if (role === "specifier") {
          return Promise.resolve({
            role,
            featureId: "clarify-behavior",
            summary: "needs another pass",
            specification:
              "Feature: Clarify behavior\n\n  Scenario: Pending clarification\n    Given an ambiguous request\n    When it is specified\n    Then the behavior is explicit",
            assumptions: ["The ambiguity can be resolved by the architect."],
            outOfScope: [],
            artifacts: [],
            evidence: [],
            decision: "handoff",
            nextRole: "architect",
            reason: "architectural review is needed",
          });
        }

        return Promise.resolve({
          role: "architect",
          summary: "needs specification clarification",
          design: "No design until the ambiguity is resolved.",
          changePlan: {
            applicationName: "business-app",
            contexts: ["clarify-behavior"],
            dataRequired: false,
            backendRequired: true,
            frontendRequired: false,
          },
          domainModel: [],
          apiContract: [],
          security: [],
          constraints: [],
          risks: ["Ambiguous behavior."],
          artifacts: [],
          evidence: [],
          decision: "handoff",
          nextRole: "specifier",
          reason: "ambiguity remains",
        });
      },
    };

    expect(
      runDevelopmentTeam(
        loopRunner,
        directory,
        new AutomaticSpecificationReviewer(),
        new FileSpecificationJournal(),
      ),
    ).rejects.toThrow("Maximum turn count (2) reached");
    expect((await loadRunState(directory)).turns).toBe(2);
  });

  test("returns requested specification changes to the specifier", async () => {
    const directory = await newRun();
    let reviewCount = 0;
    const reviewer: SpecificationReviewer = {
      review: () => {
        reviewCount += 1;

        return Promise.resolve(
          reviewCount === 1
            ? {
                decision: "changes_requested" as const,
                feedback: "Add an explicit rejected-input example.",
              }
            : { decision: "approved" as const, feedback: null },
        );
      },
    };
    const result = await runDevelopmentTeam(
      new ScriptedAgentRunner(),
      directory,
      reviewer,
      new FileSpecificationJournal(),
    );

    expect(result.status).toBe("completed");
    expect(result.turns).toBe(8);
    expect(result.specificationReviews.map(({ decision }) => decision)).toEqual([
      "changes_requested",
      "approved",
    ]);
    expect(result.specificationReviews[0]?.feedback).toContain("rejected-input");
    expect(result.messages.map(({ from, to }) => [from, to])).toEqual([
      ["user", "specifier"],
      ["specifier", "architect"],
      ["architect", "ui-designer"],
      ["ui-designer", "data-engineer"],
      ["data-engineer", "backend-coder"],
      ["backend-coder", "frontend-coder"],
      ["frontend-coder", "qa"],
      ["qa", null],
    ]);
  });

  test("returns invalid Gherkin to the specifier before asking the human", async () => {
    const directory = await newRun();
    const scripted = new ScriptedAgentRunner();
    let specifierRuns = 0;
    let reviews = 0;
    const runner: AgentRunner = {
      async run(context) {
        const turn = await scripted.run(context);

        if (
          context.role === "specifier" &&
          ++specifierRuns === 1 &&
          turn.role === "specifier"
        ) {
          return {
            ...turn,
            specification: "Feature: Incomplete\nScenario: Missing steps",
          };
        }

        return turn;
      },
    };
    const reviewer: SpecificationReviewer = {
      review() {
        reviews += 1;

        return Promise.resolve({ decision: "approved", feedback: null });
      },
    };

    const result = await runDevelopmentTeam(
      runner,
      directory,
      reviewer,
      new FileSpecificationJournal(),
    );

    expect(result.turns).toBe(8);
    expect(reviews).toBe(1);
    expect(
      result.localChecks
        .filter(({ kind }) => kind === "gherkin")
        .map(({ passed }) => passed),
    ).toEqual([false, true]);
  });

  test("returns a failed local quality gate directly to the backend coder", async () => {
    const directory = await newRun();
    const state = await loadRunState(directory);
    await mkdir(resolve(state.workspace, "src", "contexts", "decisions", "domain"), {
      recursive: true,
    });
    const scripted = new ScriptedAgentRunner();
    let coderRuns = 0;
    let qaRuns = 0;
    const runner: AgentRunner = {
      async run(context) {
        const turn = await scripted.run(context);

        if (context.role === "qa") {
          qaRuns += 1;
        }

        if (context.role !== "backend-coder" || turn.role !== "backend-coder") {
          return turn;
        }

        coderRuns += 1;
        const path = resolve(
          context.state.workspace,
          "src",
          "contexts",
          "decisions",
          "domain",
          "decision.ts",
        );
        const source =
          coderRuns === 1
            ? `export function decide(values: boolean[]): number {
  let result = 0;
  ${Array.from({ length: 11 }, (_, index) => `if (values[${index}]) result += 1;`).join("\n  ")}
  return result;
}\n`
            : "export const decide = (value: boolean): number => value ? 1 : 0;\n";
        await writeFile(path, source);

        return {
          turn: {
            ...turn,
            artifacts: ["src/contexts/decisions/domain/decision.ts"],
          },
          usage: null,
          observations: { commands: [], changedFiles: [path] },
        };
      },
    };

    const result = await runDevelopmentTeam(
      runner,
      directory,
      new AutomaticSpecificationReviewer(),
      new FileSpecificationJournal(),
    );

    expect(coderRuns).toBe(2);
    expect(qaRuns).toBe(1);
    expect(
      result.localChecks
        .filter(({ kind, role }) => kind === "quality-gate" && role === "backend-coder")
        .map(({ passed }) => passed),
    ).toEqual([false, true]);
  });
});
