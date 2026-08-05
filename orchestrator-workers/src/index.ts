import OpenAI from "openai";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { OpenAIAgentRunner } from "./agents/openai-agent-runner.ts";
import { askMealPlanRequest, closeQuestions } from "./cli/questions.ts";
import { loadConfig } from "./config.ts";
import { FakeAgentRunner } from "./demo/fake-agent-runner.ts";
import { demoRequest } from "./demo/request.ts";
import { createWeeklyPlan } from "./orchestration/orchestrator.ts";
import { RunTracer } from "./observability/run-tracer.ts";
import { openInDefaultBrowser } from "./output/open-browser.ts";
import { renderHtml } from "./output/render-html.ts";

const isDemo = process.argv.includes("--demo");
const shouldOpenBrowser = !process.argv.includes("--no-open");
const outputDirectory = resolve(import.meta.dir, "../output");
const outputFileName = isDemo ? "weekly-menu.html" : "generated-weekly-menu.html";
const outputPath = resolve(outputDirectory, outputFileName);

async function run(): Promise<void> {
  const config = loadConfig();

  if (!isDemo && !process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing. Copy .env.example to .env and add your key.",
    );
  }

  const request = isDemo ? demoRequest : await askMealPlanRequest();

  if (isDemo) {
    console.log("Demo mode: using deterministic fake agents and simulated latency.\n");
  } else {
    closeQuestions();
  }

  const runner = isDemo
    ? new FakeAgentRunner()
    : new OpenAIAgentRunner(new OpenAI(), config);
  const tracer = new RunTracer();
  const finalPlan = await createWeeklyPlan(runner, tracer, config, request);
  tracer.summary();

  await mkdir(outputDirectory, { recursive: true });
  await Bun.write(outputPath, renderHtml(finalPlan));
  console.log(`\n✓ HTML generated at ${outputPath}`);

  if (shouldOpenBrowser) {
    await openInDefaultBrowser(outputPath);
    console.log("✓ Opened in the default browser");
  }
}

try {
  await run();
} catch (error) {
  closeQuestions();
  console.error(error instanceof Error ? `\nError: ${error.message}` : error);
  process.exitCode = 1;
}
