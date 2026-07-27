import { describe, expect, test } from "bun:test";
import { assertDishesPreserveSkeleton } from "../src/domain/contracts.ts";
import { demoPlan } from "../src/demo/plan.ts";

describe("contracts between stages", () => {
  test("accepts a meal plan that enriches the skeleton", () => {
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

  test("rejects a stage that changes a previous date", () => {
    const skeleton = {
      ...demoPlan.menu,
      days: demoPlan.menu.days.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        meals: day.meals.map((meal) => ({ type: meal.type })),
      })),
    };
    const changed = structuredClone(demoPlan.menu);
    changed.days[0]!.date = "2099-01-01";

    expect(() => assertDishesPreserveSkeleton(skeleton, changed)).toThrow(
      "Contract violation",
    );
  });
});
