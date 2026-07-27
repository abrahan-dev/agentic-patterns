import { describe, expect, test } from "bun:test";
import { assertDishesPreserveSkeleton } from "../src/contracts.ts";
import { demoPlan } from "../src/demo.ts";

describe("contratos entre etapas", () => {
  test("acepta un menú que enriquece el esqueleto", () => {
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

  test("rechaza que una etapa cambie una fecha previa", () => {
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
      "Contrato incumplido",
    );
  });
});
