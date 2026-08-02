import { isDeepStrictEqual } from "node:util";
import type {
  MenuSkeleton,
  MenuWithRecipes,
  NutritionSpecification,
  PlannedMenu,
  ShoppingPlan,
  WeekPreferences,
} from "./schemas.ts";

function fail(stage: string, detail: string): never {
  throw new Error(`Contract violation in ${stage}: ${detail}`);
}

export function assertSkeletonMatchesPreferences(
  preferences: WeekPreferences,
  skeleton: MenuSkeleton,
): void {
  const start = new Date(`${preferences.startsOn}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    skeleton.startsOn !== preferences.startsOn ||
    skeleton.days.length !== 7
  ) {
    fail("menu_skeleton", "the requested start date or seven-day structure changed");
  }

  const received = skeleton.days.map((day) => ({
    date: day.date,
    dayName: day.dayName,
    mealTypes: day.meals.map((meal) => meal.type),
  }));
  const expected = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      date: date.toISOString().slice(0, 10),
      dayName: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }).format(date),
      mealTypes: preferences.mealTypes,
    };
  });

  if (!isDeepStrictEqual(expected, received)) {
    fail("menu_skeleton", "dates, day names, or meal slots changed");
  }
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

const ingredientFamilies: Record<string, string[]> = {
  dairy: ["milk", "cheese", "butter", "cream", "yogurt", "whey", "casein"],
  gluten: ["wheat", "barley", "rye", "flour", "bread", "pasta", "couscous"],
  nuts: ["almond", "cashew", "walnut", "pecan", "pistachio", "hazelnut"],
  "animal products": [
    "meat",
    "beef",
    "pork",
    "chicken",
    "fish",
    "seafood",
    "egg",
    "milk",
    "cheese",
    "butter",
    "cream",
    "yogurt",
    "honey",
    "gelatin",
  ],
};

function normalizeIngredient(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function containsIngredientTerm(ingredient: string, prohibitedTerm: string): boolean {
  const ingredientTokens = ingredient.split(" ");
  const termTokens = prohibitedTerm.split(" ");

  if (termTokens.length > 1) {
    return ` ${ingredient} `.includes(` ${prohibitedTerm} `);
  }

  const [term] = termTokens;

  return ingredientTokens.some(
    (token) =>
      token === term ||
      token === `${term}s` ||
      `${token}s` === term ||
      token === `${term}es` ||
      `${token}es` === term,
  );
}

export function assertRecipesRespectNutrition(
  specification: NutritionSpecification,
  plan: MenuWithRecipes,
): void {
  const restrictions = [...specification.allergens, ...specification.excludedIngredients]
    .map(normalizeIngredient)
    .filter(Boolean);
  const violations: string[] = [];

  for (const recipe of plan.recipes) {
    for (const ingredient of recipe.ingredients) {
      const ingredientName = normalizeIngredient(ingredient.name);

      for (const restriction of restrictions) {
        const prohibitedTerms = [restriction, ...(ingredientFamilies[restriction] ?? [])];

        if (
          prohibitedTerms.some((term) =>
            containsIngredientTerm(ingredientName, normalizeIngredient(term)),
          )
        ) {
          violations.push(`${recipe.dish}: ${ingredient.name} (${restriction})`);
        }
      }
    }
  }

  if (violations.length > 0) {
    fail(
      "menu_with_recipes",
      `ingredients violate the nutrition specification: ${violations.join(", ")}`,
    );
  }
}

export function assertShoppingPreservesPlan(
  plan: MenuWithRecipes,
  finalPlan: ShoppingPlan,
): void {
  if (
    !isDeepStrictEqual(plan.menu, finalPlan.menu) ||
    !isDeepStrictEqual(plan.recipes, finalPlan.recipes)
  ) {
    fail("final_weekly_plan", "the meal plan or recipes were modified");
  }
}
