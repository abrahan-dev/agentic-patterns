import { describe, expect, test } from "bun:test";
import {
  assertDishesPreserveSkeleton,
  assertRecipesPreserveMenu,
  assertRecipesRespectNutrition,
  assertSkeletonMatchesPreferences,
} from "../src/domain/contracts.ts";
import { demoPlan } from "../src/demo/plan.ts";

describe("contracts between routed stages", () => {
  test("accepts a skeleton that exactly matches the requested week", () => {
    const skeleton = {
      ...demoPlan.menu,
      days: demoPlan.menu.days.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        meals: day.meals.map((meal) => ({ type: meal.type })),
      })),
    };

    expect(() =>
      assertSkeletonMatchesPreferences(
        { startsOn: "2026-08-03", mealTypes: ["lunch"] },
        skeleton,
      ),
    ).not.toThrow();
  });

  test("rejects a skeleton that changes the requested meal slots", () => {
    const skeleton = {
      ...demoPlan.menu,
      days: demoPlan.menu.days.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        meals: day.meals.map(() => ({ type: "dinner" as const })),
      })),
    };

    expect(() =>
      assertSkeletonMatchesPreferences(
        { startsOn: "2026-08-03", mealTypes: ["lunch"] },
        skeleton,
      ),
    ).toThrow("Contract violation in menu_skeleton");
  });

  test("accepts dishes that preserve the general agent's skeleton", () => {
    const skeleton = {
      ...demoPlan.menu,
      days: demoPlan.menu.days.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        meals: day.meals.map((meal) => ({ type: meal.type })),
      })),
    };

    expect(() => assertDishesPreserveSkeleton(skeleton, demoPlan.menu)).not.toThrow();
  });

  test("accepts recipes that preserve the nutritionist's menu", () => {
    expect(() =>
      assertRecipesPreserveMenu(demoPlan.menu, {
        menu: demoPlan.menu,
        recipes: demoPlan.recipes,
      }),
    ).not.toThrow();
  });

  test("rejects recipe ingredients that violate an allergen restriction", () => {
    const plan = structuredClone(demoPlan);
    plan.recipes[0]!.ingredients.push({ name: "whole milk", quantity: "100 ml" });

    expect(() =>
      assertRecipesRespectNutrition(
        {
          summary: "Dairy-free menu",
          dietaryPattern: "general",
          goals: [],
          allergens: ["dairy"],
          excludedIngredients: [],
          recommendations: [],
        },
        { menu: plan.menu, recipes: plan.recipes },
      ),
    ).toThrow("ingredients violate the nutrition specification");
  });

  test("does not confuse an allergen with part of another ingredient name", () => {
    const plan = structuredClone(demoPlan);
    plan.recipes[0]!.ingredients.push({ name: "eggplant", quantity: "100 g" });

    expect(() =>
      assertRecipesRespectNutrition(
        {
          summary: "Egg-free menu",
          dietaryPattern: "general",
          goals: [],
          allergens: ["egg"],
          excludedIngredients: [],
          recommendations: [],
        },
        { menu: plan.menu, recipes: plan.recipes },
      ),
    ).not.toThrow();
  });
});
