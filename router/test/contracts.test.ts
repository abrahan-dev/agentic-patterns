import { describe, expect, test } from "bun:test";
import {
  assertDishesPreserveSkeleton,
  assertRecipesPreserveMenu,
} from "../src/domain/contracts.ts";
import { demoPlan } from "../src/demo/plan.ts";

describe("contracts between routed stages", () => {
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
});
