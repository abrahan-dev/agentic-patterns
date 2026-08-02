import type {
  MenuSkeleton,
  MenuWithRecipes,
  NutritionSpecification,
  NutritionRequest,
  PlannedMenu,
  RecipeDetail,
  WeekPreferences,
} from "../domain/schemas.ts";

const JSON_CONTEXT = (value: unknown): string => JSON.stringify(value, null, 2);

export function schemaPrompt(preferences: WeekPreferences): string {
  return `Create the structure of a weekly meal plan with exactly seven days.
The week starts on ${preferences.startsOn}.
Each day must contain exactly these meal slots, in this order: ${preferences.mealTypes.join(", ")}.
This stage only creates the calendar and meal slots. Do not invent dishes yet.`;
}

export function nutritionRoutingInput(request: NutritionRequest): string {
  return (
    request.message.trim() ||
    "I have no special dietary requirements, allergies, or nutrition goals."
  );
}

export function nutritionPrompt(userMessage: string): string {
  return `Create a concise nutrition specification that a cook can use to design a weekly menu.
Extract only requirements supported by the user's message. Do not diagnose medical conditions, select dishes, or write recipes.
Use "general" as the dietary pattern when no specific pattern is requested.
Express allergens and excluded ingredients as specific ingredient names or recognizable families so they can be checked against recipe ingredients.

USER DIETARY NEEDS:
${userMessage}`;
}

export function cuisineRoutingInput(userMessage: string): string {
  return userMessage.trim() || "I want a general cooking style with no specific cuisine.";
}

export function dishesPrompt(
  skeleton: MenuSkeleton,
  specification: NutritionSpecification,
  cuisineRequest: string,
): string {
  return `Select a dish for every meal slot using your culinary specialty.
Strictly respect the nutrition specification, including every allergen and excluded ingredient.
Preserve the dates, day names, and meal types from the input skeleton exactly.
Avoid unnecessary repetition and reuse ingredients where practical to reduce waste.
The user's cuisine preference was: ${cuisineRequest}.
Write a one-sentence summary of the completed menu that mentions its culinary style and most important nutrition characteristics.

NUTRITION SPECIFICATION:
${JSON_CONTEXT(specification)}

INPUT SKELETON:
${JSON_CONTEXT(skeleton)}`;
}

export function recipesPrompt(
  menu: PlannedMenu,
  specification: NutritionSpecification,
  cuisinePreference: string,
  detail: RecipeDetail,
): string {
  return `Create one ${detail} recipe for every dish in the meal plan using your culinary specialty.
Preserve the input meal plan without changes and continue to respect the nutrition specification.
Faithfully follow the user's requested cooking style: ${cuisinePreference}.
Link every recipe by date, meal type, and dish. Use standard home-kitchen equipment.
Provide useful quantities for one person; the shopping-list stage will consolidate them.

NUTRITION SPECIFICATION:
${JSON_CONTEXT(specification)}

INPUT MEAL PLAN:
${JSON_CONTEXT(menu)}`;
}

export function shoppingPrompt(plan: MenuWithRecipes): string {
  return `Generate the complete shopping list from all recipes.
Preserve the input meal plan and recipes without changes.
Merge equivalent ingredients, add their quantities, use practical units, and group items by supermarket section.
Do not include utensils or ingredients that do not appear in the recipes.

PLAN WITH RECIPES:
${JSON_CONTEXT(plan)}`;
}
