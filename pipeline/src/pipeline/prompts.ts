import type {
  FoodPreferences,
  MenuSkeleton,
  MenuWithRecipes,
  PlannedMenu,
  RecipeDetail,
  WeekPreferences,
} from "../domain/schemas.ts";

const JSON_CONTEXT = (value: unknown) => JSON.stringify(value, null, 2);

export function schemaPrompt(preferences: WeekPreferences): string {
  return `Create the structure of a weekly meal plan with exactly seven days.
The week starts on ${preferences.startsOn}.
Each day must contain exactly these meal slots, in this order: ${preferences.mealTypes.join(", ")}.
This stage only creates the calendar and meal slots. Do not invent dishes yet.`;
}

export function dishesPrompt(
  skeleton: MenuSkeleton,
  preferences: FoodPreferences,
): string {
  return `Fill every meal slot with a specific, varied, and realistic dish.
Preserve the dates, day names, and meal types from the input skeleton exactly.
Dietary restrictions or preferences: ${preferences.restrictions || "none"}.
Avoid unnecessary repetition and reuse ingredients where practical to reduce waste.

INPUT SKELETON:
${JSON_CONTEXT(skeleton)}`;
}

export function recipesPrompt(menu: PlannedMenu, detail: RecipeDetail): string {
  return `Add one recipe for every dish in the meal plan.
Recipes must be ${detail}, suitable for home cooking, and possible with standard kitchen equipment.
Preserve the input meal plan without changes. Each recipe must be linked by date, meal type, and dish.
Provide useful quantities for one person; the shopping-list stage will consolidate them.

INPUT MEAL PLAN:
${JSON_CONTEXT(menu)}`;
}

export function shoppingPrompt(plan: MenuWithRecipes): string {
  return `Generate the complete shopping list from all recipes.
Preserve the input meal plan and recipes without changes.
Merge equivalent ingredients, add their quantities, use practical units, and group items
by common supermarket sections such as produce, meat, dairy, and pantry.
Do not include utensils or ingredients that do not appear in the recipes.

PLAN WITH RECIPES:
${JSON_CONTEXT(plan)}`;
}
