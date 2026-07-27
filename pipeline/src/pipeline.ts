import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";
import {
  finalPlanSchema,
  menuSkeletonSchema,
  menuWithRecipesSchema,
  plannedMenuSchema,
  type FinalPlan,
  type FoodPreferences,
  type MenuSkeleton,
  type MenuWithRecipes,
  type PlannedMenu,
  type RecipeDetail,
  type WeekPreferences,
} from "./schemas.ts";
import {
  dishesPrompt,
  recipesPrompt,
  schemaPrompt,
  shoppingPrompt,
} from "./prompts.ts";
import {
  assertDishesPreserveSkeleton,
  assertRecipesPreserveMenu,
  assertShoppingPreservesPlan,
} from "./contracts.ts";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-sol";

async function runStructuredStep<T>(
  client: OpenAI,
  name: string,
  prompt: string,
  schema: ZodType<T>,
): Promise<T> {
  console.log(`\n→ ${name}`);

  const response = await client.responses.parse({
    model: MODEL,
    reasoning: { effort: "low" },
    input: [
      {
        role: "system",
        content:
          "Eres un planificador culinario. Sigue el objetivo de la etapa, conserva fielmente el contexto de entrada y responde en español.",
      },
      { role: "user", content: prompt },
    ],
    text: {
      format: zodTextFormat(schema, name),
    },
  });

  if (!response.output_parsed) {
    throw new Error(`La etapa "${name}" no devolvió una salida estructurada.`);
  }

  console.log(`✓ ${name}`);
  return response.output_parsed;
}

export function createMenuSchema(
  client: OpenAI,
  preferences: WeekPreferences,
): Promise<MenuSkeleton> {
  return runStructuredStep(
    client,
    "menu_skeleton",
    schemaPrompt(preferences),
    menuSkeletonSchema,
  );
}

export async function fillDishes(
  client: OpenAI,
  skeleton: MenuSkeleton,
  preferences: FoodPreferences,
): Promise<PlannedMenu> {
  const menu = await runStructuredStep(
    client,
    "planned_menu",
    dishesPrompt(skeleton, preferences),
    plannedMenuSchema,
  );
  assertDishesPreserveSkeleton(skeleton, menu);
  return menu;
}

export async function addRecipes(
  client: OpenAI,
  menu: PlannedMenu,
  detail: RecipeDetail,
): Promise<MenuWithRecipes> {
  const plan = await runStructuredStep(
    client,
    "menu_with_recipes",
    recipesPrompt(menu, detail),
    menuWithRecipesSchema,
  );
  assertRecipesPreserveMenu(menu, plan);
  return plan;
}

export async function createShoppingList(
  client: OpenAI,
  plan: MenuWithRecipes,
): Promise<FinalPlan> {
  const finalPlan = await runStructuredStep(
    client,
    "final_weekly_plan",
    shoppingPrompt(plan),
    finalPlanSchema,
  );
  assertShoppingPreservesPlan(plan, finalPlan);
  return finalPlan;
}
