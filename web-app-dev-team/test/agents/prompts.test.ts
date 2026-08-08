import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, resolve } from "node:path";
import {
  buildAgentPrompt,
  loadRoleInstructions,
  roleInstructionsPath,
} from "../../src/agents/prompts.ts";
import { roles, type Handoff } from "../../src/domain/schemas.ts";
import { createRunState, saveRunState } from "../../src/orchestration/run-store.ts";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe("role instructions", () => {
  for (const role of roles) {
    test(`loads readable Markdown for ${role}`, async () => {
      const instructions = await loadRoleInstructions(role);

      expect(basename(roleInstructionsPath(role))).toBe(`${role}.md`);
      expect(instructions).toStartWith("# ");
      expect(instructions.toLowerCase()).toContain(role.replace("-", " "));
      expect(instructions).toContain("## Responsibility");
      expect(instructions.trim().length).toBeGreaterThan(100);
    });
  }

  test("architect policy keeps the opinionated DDD boundaries explicit", async () => {
    const instructions = await loadRoleInstructions("architect");

    expect(instructions).toContain("Domain code never imports tRPC");
    expect(instructions).toContain("domain/repositories");
    expect(instructions).toContain("apps/<application-name>");
    expect(instructions).toContain("tRPC v11");
    expect(instructions).toContain("Drizzle ORM");
  });
});

test("projects role-specific context and caches the workspace inventory", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "web-app-dev-team-context-"));
  temporaryDirectories.push(root);
  await writeFile(
    resolve(root, "package.json"),
    JSON.stringify({ scripts: { test: "bun test", lint: "eslint ." } }),
  );
  const created = await createRunState({
    prompt: "Implement checkout",
    workspace: root,
    runsRoot: root,
    maxTurns: 12,
  });
  const handoffs = [
    {
      id: "specifier",
      sequence: 1,
      from: "specifier",
      to: "architect",
      createdAt: new Date().toISOString(),
      turn: {
        role: "specifier",
        featureId: "secret-old-spec",
        summary: "IRRELEVANT_SPECIFIER_HISTORY",
        specification: "Feature: Old",
        assumptions: [],
        outOfScope: [],
        artifacts: [],
        evidence: [],
        decision: "handoff",
        nextRole: "architect",
        reason: "ready",
      },
    },
    {
      id: "architect",
      sequence: 2,
      from: "architect",
      to: "backend-coder",
      createdAt: new Date().toISOString(),
      turn: {
        role: "architect",
        summary: "LATEST_ARCHITECTURE",
        design: "Use a checkout aggregate.",
        changePlan: {
          applicationName: "operations",
          contexts: ["checkout"],
          dataRequired: false,
          backendRequired: true,
          frontendRequired: false,
        },
        domainModel: ["Checkout aggregate"],
        apiContract: ["checkout.submit mutation"],
        security: ["Authenticated actor"],
        constraints: [],
        risks: [],
        artifacts: [],
        evidence: [],
        decision: "handoff",
        nextRole: "backend-coder",
        reason: "implement",
      },
    },
    {
      id: "qa",
      sequence: 3,
      from: "qa",
      to: "backend-coder",
      createdAt: new Date().toISOString(),
      turn: {
        role: "qa",
        summary: "LATEST_QA_FEEDBACK",
        scenariosTested: [],
        commands: [],
        failures: ["Checkout rejects valid carts."],
        failureOwner: "backend-coder",
        artifacts: [],
        evidence: [],
        decision: "handoff",
        nextRole: "backend-coder",
        reason: "fix",
      },
    },
  ] satisfies Handoff[];
  created.state.currentRole = "backend-coder";
  created.state.messages.push(...handoffs);
  await saveRunState(created.runDirectory, created.state);

  const prompt = await buildAgentPrompt({
    role: "backend-coder",
    state: created.state,
    runDirectory: created.runDirectory,
  });

  expect(prompt).toContain("LATEST_ARCHITECTURE");
  expect(prompt).toContain("LATEST_QA_FEEDBACK");
  expect(prompt).not.toContain("IRRELEVANT_SPECIFIER_HISTORY");
  expect(prompt).toContain("Available scripts: lint, test");
  expect(
    await readFile(resolve(created.runDirectory, "workspace-facts.json"), "utf8"),
  ).toContain('"lint": "eslint ."');
});
