import OpenAI from "openai";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { demoPlan } from "./demo.ts";
import { openInDefaultBrowser } from "./open-browser.ts";
import {
  addRecipes,
  createMenuSchema,
  createShoppingList,
  fillDishes,
} from "./pipeline.ts";
import {
  askFoodPreferences,
  askRecipeDetail,
  askWeekPreferences,
  closeQuestions,
} from "./questions.ts";
import { renderHtml } from "./render.ts";

const isDemo = process.argv.includes("--demo");
const outputDirectory = resolve(import.meta.dir, "../output");
const outputPath = resolve(outputDirectory, "weekly-menu.html");

async function run(): Promise<void> {
  let finalPlan;

  if (isDemo) {
    console.log("Demo mode: skipping OpenAI API calls.");
    finalPlan = demoPlan;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is missing. Copy .env.example to .env and add your key.",
      );
    }

    const client = new OpenAI();

    // The pipeline remains explicit: each stage feeds the next one.
    const weekPreferences = await askWeekPreferences();
    const skeleton = await createMenuSchema(client, weekPreferences);

    const foodPreferences = await askFoodPreferences();
    const menu = await fillDishes(client, skeleton, foodPreferences);

    const recipeDetail = await askRecipeDetail();
    closeQuestions();
    const planWithRecipes = await addRecipes(client, menu, recipeDetail);

    // This stage does not need any additional user context.
    finalPlan = await createShoppingList(client, planWithRecipes);
  }

  await mkdir(outputDirectory, { recursive: true });
  await Bun.write(outputPath, renderHtml(finalPlan));
  console.log(`\n✓ HTML generated at ${outputPath}`);
  await openInDefaultBrowser(outputPath);
  console.log("✓ Opened in the default browser");
}

try {
  await run();
} catch (error) {
  closeQuestions();
  console.error(error instanceof Error ? `\nError: ${error.message}` : error);
  process.exitCode = 1;
}
