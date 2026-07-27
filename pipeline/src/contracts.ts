import { isDeepStrictEqual } from "node:util";
import type {
  FinalPlan,
  MenuSkeleton,
  MenuWithRecipes,
  PlannedMenu,
} from "./schemas.ts";

function fail(stage: string, detail: string): never {
  throw new Error(`Contract violation in ${stage}: ${detail}`);
}

export function assertDishesPreserveSkeleton(
  skeleton: MenuSkeleton,
  menu: PlannedMenu,
): void {
  const expected = skeleton.days.map((day) => ({
    date: day.date,
    dayName: day.dayName,
    mealTypes: day.meals.map((meal) => meal.type),
  }));
  const received = menu.days.map((day) => ({
    date: day.date,
    dayName: day.dayName,
    mealTypes: day.meals.map((meal) => meal.type),
  }));

  if (
    skeleton.title !== menu.title ||
    skeleton.startsOn !== menu.startsOn ||
    !isDeepStrictEqual(expected, received)
  ) {
    fail("planned_menu", "the structure defined by the first stage was modified");
  }
}

export function assertRecipesPreserveMenu(
  menu: PlannedMenu,
  plan: MenuWithRecipes,
): void {
  if (!isDeepStrictEqual(menu, plan.menu)) {
    fail("menu_with_recipes", "the input meal plan was modified");
  }

  const expectedMeals = menu.days.flatMap((day) =>
    day.meals.map((meal) => `${day.date}|${meal.type}|${meal.dish}`),
  );
  const receivedRecipes = plan.recipes.map(
    (recipe) => `${recipe.date}|${recipe.mealType}|${recipe.dish}`,
  );

  if (
    expectedMeals.length !== receivedRecipes.length ||
    !expectedMeals.every((meal) => receivedRecipes.includes(meal))
  ) {
    fail("menu_with_recipes", "there must be exactly one recipe per dish");
  }
}

export function assertShoppingPreservesPlan(
  plan: MenuWithRecipes,
  finalPlan: FinalPlan,
): void {
  if (
    !isDeepStrictEqual(plan.menu, finalPlan.menu) ||
    !isDeepStrictEqual(plan.recipes, finalPlan.recipes)
  ) {
    fail("final_weekly_plan", "the meal plan or recipes were modified");
  }
}
