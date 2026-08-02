import OpenAI from "openai";
import {
  finalPlanSchema,
  menuSkeletonSchema,
  menuWithRecipesSchema,
  nutritionSpecificationSchema,
  plannedMenuSchema,
  type FinalPlan,
  type MenuSkeleton,
  type MenuWithRecipes,
  type NutritionSpecification,
  type NutritionRequest,
  type PlannedMenu,
  type RecipeDetail,
  type WeekPreferences,
} from "../domain/schemas.ts";
import {
  assertDishesPreserveSkeleton,
  assertRecipesPreserveMenu,
  assertShoppingPreservesPlan,
} from "../domain/contracts.ts";
import {
  cookAgents,
  generalAgent,
  nutritionAgents,
  type AgentDefinition,
} from "../agents/catalog.ts";
import { runFallbackAgent, runStructuredAgent } from "../agents/run-agent.ts";
import { routeRequest } from "../router/router.ts";
import {
  cuisineRoutingInput,
  dishesPrompt,
  nutritionPrompt,
  nutritionRoutingInput,
  recipesPrompt,
  schemaPrompt,
  shoppingPrompt,
} from "./prompts.ts";

export interface RoutedMenu {
  menu: PlannedMenu;
  cook: AgentDefinition;
}

async function reportUnrelatedAnswer(
  client: OpenAI,
  userMessage: string,
  expectedTopic: string,
): Promise<void> {
  const fallback = await runFallbackAgent(client, userMessage, expectedTopic);

  console.error(
    `\n⚠ The detected topic "${fallback.topic}" does not match this question.`,
  );
  console.error(`  ${fallback.message}`);
  console.error("  Please enter the requested information and try again.");
}

export function createMenuSchema(
  client: OpenAI,
  preferences: WeekPreferences,
): Promise<MenuSkeleton> {
  return runStructuredAgent(
    client,
    generalAgent,
    "menu_skeleton",
    schemaPrompt(preferences),
    menuSkeletonSchema,
  );
}

export async function createNutritionSpecification(
  client: OpenAI,
  request: NutritionRequest,
): Promise<NutritionSpecification | undefined> {
  const userMessage = nutritionRoutingInput(request);
  const route = await routeRequest(client, userMessage, nutritionAgents);

  if (route.agent.id === "fallback") {
    await reportUnrelatedAnswer(
      client,
      userMessage,
      "diet type, allergies, dietary restrictions, or nutrition goals",
    );

    return undefined;
  }

  const specification = await runStructuredAgent(
    client,
    route.agent,
    "nutrition_specification",
    nutritionPrompt(userMessage),
    nutritionSpecificationSchema,
  );

  console.log(`\nNutrition report:\n${JSON.stringify(specification, null, 2)}`);

  return specification;
}

export async function fillDishes(
  client: OpenAI,
  skeleton: MenuSkeleton,
  specification: NutritionSpecification,
  cuisinePreference: string,
): Promise<RoutedMenu | undefined> {
  const userMessage = cuisineRoutingInput(cuisinePreference);
  const route = await routeRequest(client, userMessage, cookAgents);

  if (route.agent.id === "fallback") {
    await reportUnrelatedAnswer(
      client,
      userMessage,
      "a Mediterranean, Asian, or general cooking-style preference",
    );

    return undefined;
  }

  const menu = await runStructuredAgent(
    client,
    route.agent,
    "planned_menu",
    dishesPrompt(skeleton, specification, userMessage),
    plannedMenuSchema,
  );
  assertDishesPreserveSkeleton(skeleton, menu);

  return { menu, cook: route.agent };
}

export async function addRecipes(
  client: OpenAI,
  routedMenu: RoutedMenu,
  specification: NutritionSpecification,
  detail: RecipeDetail,
): Promise<MenuWithRecipes> {
  const plan = await runStructuredAgent(
    client,
    routedMenu.cook,
    "menu_with_recipes",
    recipesPrompt(routedMenu.menu, specification, detail),
    menuWithRecipesSchema,
  );
  assertRecipesPreserveMenu(routedMenu.menu, plan);

  return plan;
}

export async function createShoppingList(
  client: OpenAI,
  plan: MenuWithRecipes,
): Promise<FinalPlan> {
  const finalPlan = await runStructuredAgent(
    client,
    generalAgent,
    "final_weekly_plan",
    shoppingPrompt(plan),
    finalPlanSchema,
  );
  assertShoppingPreservesPlan(plan, finalPlan);

  return finalPlan;
}
