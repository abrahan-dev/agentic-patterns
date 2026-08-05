import type { MealPlanRequest } from "../domain/schemas.ts";

export const demoRequest: MealPlanRequest = {
  week: {
    startsOn: "2026-08-03",
    mealTypes: ["lunch", "dinner"],
  },
  food: {
    restrictions: "No peanuts",
    cuisine: "Varied Mediterranean and Asian influences",
  },
  recipeDetail: "concise",
};
