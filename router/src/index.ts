import OpenAI from "openai";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  askCuisinePreference,
  askNutritionRequest,
  askRecipeDetail,
  askWeekPreferences,
  closeQuestions,
} from "./cli/questions.ts";
import { demoPlan } from "./demo/plan.ts";
import { openInDefaultBrowser } from "./output/open-browser.ts";
import { renderHtml } from "./output/render-html.ts";
import {
  addRecipes,
  createMenuSchema,
  createNutritionSpecification,
  createShoppingList,
  fillDishes,
} from "./pipeline/stages.ts";
import type { NutritionSpecification } from "./domain/schemas.ts";
import type { RoutedMenu } from "./pipeline/stages.ts";

const isDemo = process.argv.includes("--demo");
const outputDirectory = resolve(import.meta.dir, "../output");
const outputFileName = isDemo ? "weekly-menu.html" : "generated-weekly-menu.html";
const outputPath = resolve(outputDirectory, outputFileName);

async function run(): Promise<void> {
  let finalPlan;

  if (isDemo) {
    console.log("Demo mode: skipping OpenAI API calls and router decisions.");
    finalPlan = demoPlan;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is missing. Copy .env.example to .env and add your key.",
      );
    }

    const client = new OpenAI();
    const weekPreferences = await askWeekPreferences();
    const skeleton = await createMenuSchema(client, weekPreferences);

    let specification: NutritionSpecification | undefined;

    while (!specification) {
      const nutritionRequest = await askNutritionRequest();
      specification = await createNutritionSpecification(client, nutritionRequest);
    }

    let routedMenu: RoutedMenu | undefined;

    while (!routedMenu) {
      const cuisinePreference = await askCuisinePreference();
      routedMenu = await fillDishes(client, skeleton, specification, cuisinePreference);
    }

    const recipeDetail = await askRecipeDetail();
    closeQuestions();
    const planWithRecipes = await addRecipes(
      client,
      routedMenu,
      specification,
      recipeDetail,
    );
    console.log("\nStage 5 · Shopping list · direct general agent");
    finalPlan = await createShoppingList(client, planWithRecipes, specification);
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
