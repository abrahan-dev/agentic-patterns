import { z } from "zod";

// These domain schemas define the data contract for all pipeline stages.
export const mealTypeSchema = z.enum(["breakfast", "lunch", "snack", "dinner"]);

export const menuSlotSchema = z.object({
  type: mealTypeSchema,
});

export const daySkeletonSchema = z.object({
  date: z.string().describe("ISO date in YYYY-MM-DD format"),
  dayName: z.string().describe("Day name in English"),
  meals: z.array(menuSlotSchema),
});

export const menuSkeletonSchema = z.object({
  title: z.string(),
  startsOn: z.string().describe("ISO date in YYYY-MM-DD format"),
  days: z.array(daySkeletonSchema).length(7),
});

export const plannedMealSchema = menuSlotSchema.extend({
  dish: z.string(),
  description: z.string(),
});

export const plannedDaySchema = daySkeletonSchema.extend({
  meals: z.array(plannedMealSchema),
});

export const plannedMenuSchema = menuSkeletonSchema.extend({
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

export const menuWithRecipesSchema = z.object({
  menu: plannedMenuSchema,
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

export const finalPlanSchema = menuWithRecipesSchema.extend({
  shoppingList: z.array(shoppingSectionSchema),
});

export type MealType = z.infer<typeof mealTypeSchema>;
export type MenuSkeleton = z.infer<typeof menuSkeletonSchema>;
export type PlannedMenu = z.infer<typeof plannedMenuSchema>;
export type MenuWithRecipes = z.infer<typeof menuWithRecipesSchema>;
export type FinalPlan = z.infer<typeof finalPlanSchema>;

export interface WeekPreferences {
  startsOn: string;
  mealTypes: MealType[];
}

export interface FoodPreferences {
  restrictions: string;
}

export type RecipeDetail = "concise" | "detailed";
