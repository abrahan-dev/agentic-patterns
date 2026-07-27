import { isDeepStrictEqual } from "node:util";
import type {
  FinalPlan,
  MenuSkeleton,
  MenuWithRecipes,
  PlannedMenu,
} from "./schemas.ts";

function fail(stage: string, detail: string): never {
  throw new Error(`Contrato incumplido en ${stage}: ${detail}`);
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
    fail("planned_menu", "se modificó la estructura definida en la primera etapa");
  }
}

export function assertRecipesPreserveMenu(
  menu: PlannedMenu,
  plan: MenuWithRecipes,
): void {
  if (!isDeepStrictEqual(menu, plan.menu)) {
    fail("menu_with_recipes", "se modificó el menú de entrada");
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
    fail("menu_with_recipes", "debe existir exactamente una receta por plato");
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
    fail("final_weekly_plan", "se modificaron el menú o las recetas");
  }
}
