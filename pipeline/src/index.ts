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
const outputPath = resolve(outputDirectory, "menu-semanal.html");

async function run(): Promise<void> {
  let finalPlan;

  if (isDemo) {
    console.log("Modo demo: se omiten las llamadas a OpenAI.");
    finalPlan = demoPlan;
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "Falta OPENAI_API_KEY. Copia .env.example a .env y añade tu clave.",
      );
    }

    const client = new OpenAI();

    // El patrón pipeline queda explícito: cada salida alimenta la etapa siguiente.
    const weekPreferences = await askWeekPreferences();
    const skeleton = await createMenuSchema(client, weekPreferences);

    const foodPreferences = await askFoodPreferences();
    const menu = await fillDishes(client, skeleton, foodPreferences);

    const recipeDetail = await askRecipeDetail();
    closeQuestions();
    const planWithRecipes = await addRecipes(client, menu, recipeDetail);

    // Esta etapa no necesita contexto adicional del usuario.
    finalPlan = await createShoppingList(client, planWithRecipes);
  }

  await mkdir(outputDirectory, { recursive: true });
  await Bun.write(outputPath, renderHtml(finalPlan));
  console.log(`\n✓ HTML generado en ${outputPath}`);
  await openInDefaultBrowser(outputPath);
  console.log("✓ Abierto en el navegador predeterminado");
}

try {
  await run();
} catch (error) {
  closeQuestions();
  console.error(error instanceof Error ? `\nError: ${error.message}` : error);
  process.exitCode = 1;
}
