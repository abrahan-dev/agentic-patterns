import OpenAI from "openai";
import {
  menuSkeletonSchema,
  menuWithRecipesSchema,
  nutritionSpecificationSchema,
  plannedMenuSchema,
  shoppingPlanSchema,
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
  assertRecipesRespectNutrition,
  assertSkeletonMatchesPreferences,
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
import type { RouteResult } from "../router/router.ts";
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
  cuisinePreference: string;
}

async function reportUnrelatedAnswer(
  client: OpenAI,
  userMessage: string,
  expectedTopic: string,
): Promise<void> {
  try {
    const fallback = await runFallbackAgent(client, userMessage, expectedTopic);

    console.error(
      `\n⚠ The detected topic "${fallback.topic}" does not match this question.`,
    );
    console.error(`  ${fallback.message}`);
  } catch {
    console.error("\n⚠ This answer does not match the current question.");
    console.error("  The fallback could not provide a more specific explanation.");
  }

  console.error("  Please enter the requested information and try again.");
}

async function reportRejectedRoute(
  client: OpenAI,
  route: RouteResult,
  userMessage: string,
  expectedTopic: string,
): Promise<void> {
  if (route.thresholdApplied) {
    const confidence = Math.round(route.decision.confidence * 100);

    console.error(
      `\n⚠ The router could not classify this answer confidently (${confidence}%).`,
    );
    console.error(`  ${route.decision.reason}`);
    console.error(`  Please clarify your answer about ${expectedTopic}.`);

    return;
  }

  if (route.availabilityOverride) {
    console.error(
      `\n⚠ The selected destination "${route.decision.destination}" is not available for this question.`,
    );
    console.error(`  Please answer with information about ${expectedTopic}.`);

    return;
  }

  await reportUnrelatedAnswer(client, userMessage, expectedTopic);
}

export async function createMenuSchema(
  client: OpenAI,
  preferences: WeekPreferences,
): Promise<MenuSkeleton> {
  const skeleton = await runStructuredAgent(
    client,
    generalAgent,
    "menu_skeleton",
    schemaPrompt(preferences),
    menuSkeletonSchema,
  );
  assertSkeletonMatchesPreferences(preferences, skeleton);

  return skeleton;
}

export async function createNutritionSpecification(
  client: OpenAI,
  request: NutritionRequest,
): Promise<NutritionSpecification | undefined> {
  const userMessage = nutritionRoutingInput(request);
  const route = await routeRequest(client, userMessage, nutritionAgents);

  if (route.agent.id === "fallback") {
    await reportRejectedRoute(
      client,
      route,
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
    await reportRejectedRoute(
      client,
      route,
      userMessage,
      "a cooking-style or cuisine preference",
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

  return { menu, cook: route.agent, cuisinePreference: userMessage };
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
    recipesPrompt(routedMenu.menu, specification, routedMenu.cuisinePreference, detail),
    menuWithRecipesSchema,
  );
  assertRecipesPreserveMenu(routedMenu.menu, plan);
  assertRecipesRespectNutrition(specification, plan);

  return plan;
}

export async function createShoppingList(
  client: OpenAI,
  plan: MenuWithRecipes,
  specification: NutritionSpecification,
): Promise<FinalPlan> {
  const shoppingPlan = await runStructuredAgent(
    client,
    generalAgent,
    "final_weekly_plan",
    shoppingPrompt(plan),
    shoppingPlanSchema,
  );
  assertShoppingPreservesPlan(plan, shoppingPlan);

  return { ...shoppingPlan, nutritionSpecification: specification };
}
