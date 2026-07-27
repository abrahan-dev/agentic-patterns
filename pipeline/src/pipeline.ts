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
import { parseReasoningEffort } from "./config.ts";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
const REASONING_EFFORT = parseReasoningEffort();

async function runStructuredStep<T>(
  client: OpenAI,
  name: string,
  prompt: string,
  schema: ZodType<T>,
): Promise<T> {
  console.log(`\n→ ${name}`);

  const response = await client.responses.parse({
    model: MODEL,
    reasoning: { effort: REASONING_EFFORT },
    input: [
      {
        role: "system",
        content:
          "You are a meal-planning assistant. Follow the goal of the current stage, preserve the input context exactly, and respond in English.",
      },
      { role: "user", content: prompt },
    ],
    text: {
      format: zodTextFormat(schema, name),
    },
  });

  if (!response.output_parsed) {
    throw new Error(`Stage "${name}" did not return structured output.`);
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
