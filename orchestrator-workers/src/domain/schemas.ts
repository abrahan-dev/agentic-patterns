import { z } from "zod";

export const mealTypeSchema = z.enum(["breakfast", "lunch", "snack", "dinner"]);

export const plannedMealSchema = z.object({
  type: mealTypeSchema,
  dish: z.string(),
  description: z.string(),
});

export const plannedDaySchema = z.object({
  date: z.string().describe("ISO date in YYYY-MM-DD format"),
  dayName: z.string().describe("Day name in English"),
  meals: z.array(plannedMealSchema),
});

export const plannedMenuSchema = z.object({
  title: z.string(),
  summary: z.string().describe("One sentence describing the weekly menu"),
  startsOn: z.string().describe("ISO date in YYYY-MM-DD format"),
  days: z.array(plannedDaySchema).length(7),
});

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
});

export const recipeSchema = z.object({
  date: z.string(),
  mealType: mealTypeSchema,
  dish: z.string(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()),
});

export const dayContributionSchema = z.object({
  taskId: z.string(),
  date: z.string(),
  recipes: z.array(recipeSchema),
});

export const shoppingItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
});

export const shoppingSectionSchema = z.object({
  section: z.string(),
  items: z.array(shoppingItemSchema),
});

export const shoppingSynthesisSchema = z.object({
  shoppingList: z.array(shoppingSectionSchema),
});

export const finalPlanSchema = z.object({
  menu: plannedMenuSchema,
  recipes: z.array(recipeSchema),
  shoppingList: z.array(shoppingSectionSchema),
});

export type MealType = z.infer<typeof mealTypeSchema>;
export type PlannedDay = z.infer<typeof plannedDaySchema>;
export type PlannedMenu = z.infer<typeof plannedMenuSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type DayContribution = z.infer<typeof dayContributionSchema>;
export type ShoppingSynthesis = z.infer<typeof shoppingSynthesisSchema>;
export type FinalPlan = z.infer<typeof finalPlanSchema>;

export interface WeekPreferences {
  startsOn: string;
  mealTypes: MealType[];
}

export interface FoodPreferences {
  restrictions: string;
  cuisine: string;
}

export type RecipeDetail = "concise" | "detailed";

export interface MealPlanRequest {
  week: WeekPreferences;
  food: FoodPreferences;
  recipeDetail: RecipeDetail;
}

export interface DayTask {
  id: string;
  day: PlannedDay;
  restrictions: string;
  recipeDetail: RecipeDetail;
}

export interface ExecutionPlan {
  menu: PlannedMenu;
  tasks: DayTask[];
}
