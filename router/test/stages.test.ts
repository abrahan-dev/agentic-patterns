import OpenAI from "openai";
import { describe, expect, mock, spyOn, test } from "bun:test";
import { agents } from "../src/agents/catalog.ts";
import { demoPlan } from "../src/demo/plan.ts";
import {
  addRecipes,
  createMenuSchema,
  createNutritionSpecification,
  createShoppingList,
} from "../src/pipeline/stages.ts";

function fakeClient(...results: unknown[]): {
  client: OpenAI;
  parse: ReturnType<typeof mock>;
} {
  const queue = [...results];
  const parse = mock(async () => {
    const result = queue.shift();

    if (result instanceof Error) {
      throw result;
    }

    return result;
  });

  return {
    client: { responses: { parse } } as unknown as OpenAI,
    parse,
  };
}

function silenceConsole(): () => void {
  const log = spyOn(console, "log").mockImplementation(() => {});
  const error = spyOn(console, "error").mockImplementation(() => {});

  return () => {
    log.mockRestore();
    error.mockRestore();
  };
}

describe("routed stage retries", () => {
  test("uses the shared fallback and returns control for an unrelated answer", async () => {
    const restore = silenceConsole();
    const { client, parse } = fakeClient(
      {
        output_parsed: {
          destination: "fallback",
          confidence: 0.99,
          reason: "The message concerns billing.",
        },
      },
      {
        output_parsed: {
          topic: "billing and discounts",
          message: "It does not describe dietary needs.",
        },
      },
    );

    try {
      const result = await createNutritionSpecification(client, {
        message: "I have a problem with my last payment",
      });

      expect(result).toBeUndefined();
      expect(parse).toHaveBeenCalledTimes(2);
    } finally {
      restore();
    }
  });

  test("does not mislabel a relevant low-confidence answer as unrelated", async () => {
    const restore = silenceConsole();
    const { client, parse } = fakeClient({
      output_parsed: {
        destination: "nutritionist",
        confidence: 0.5,
        reason: "The nutrition goal needs clarification.",
      },
    });

    try {
      const result = await createNutritionSpecification(client, {
        message: "I want to eat healthier",
      });

      expect(result).toBeUndefined();
      expect(parse).toHaveBeenCalledTimes(1);
    } finally {
      restore();
    }
  });

  test("returns control even when the fallback explanation call fails", async () => {
    const restore = silenceConsole();
    const { client, parse } = fakeClient(
      {
        output_parsed: {
          destination: "fallback",
          confidence: 0.97,
          reason: "The message concerns billing.",
        },
      },
      new Error("temporary API failure"),
    );

    try {
      const result = await createNutritionSpecification(client, {
        message: "Where is my payment discount?",
      });

      expect(result).toBeUndefined();
      expect(parse).toHaveBeenCalledTimes(2);
    } finally {
      restore();
    }
  });
});

describe("stage contract integration", () => {
  test("rejects an agent skeleton that changes the requested week", async () => {
    const restore = silenceConsole();
    const skeleton = {
      ...demoPlan.menu,
      days: demoPlan.menu.days.map((day) => ({
        date: day.date,
        dayName: day.dayName,
        meals: day.meals.map((meal) => ({ type: meal.type })),
      })),
    };
    skeleton.days[0]!.date = "2099-01-01";
    const { client } = fakeClient({ output_parsed: skeleton });

    try {
      await expect(
        createMenuSchema(client, {
          startsOn: "2026-08-03",
          mealTypes: ["lunch"],
        }),
      ).rejects.toThrow("Contract violation in menu_skeleton");
    } finally {
      restore();
    }
  });

  test("rejects allergen violations before the shopping-list stage", async () => {
    const restore = silenceConsole();
    const recipes = structuredClone(demoPlan.recipes);
    recipes[0]!.ingredients.push({ name: "whole milk", quantity: "100 ml" });
    const { client } = fakeClient({
      output_parsed: { menu: demoPlan.menu, recipes },
    });

    try {
      await expect(
        addRecipes(
          client,
          {
            menu: demoPlan.menu,
            cook: agents.general_cook,
            cuisinePreference: "Mexican cuisine",
          },
          {
            summary: "Dairy-free menu",
            dietaryPattern: "general",
            goals: [],
            allergens: ["dairy"],
            excludedIngredients: [],
            recommendations: [],
          },
          "concise",
        ),
      ).rejects.toThrow("ingredients violate the nutrition specification");
    } finally {
      restore();
    }
  });

  test("attaches the original nutrition specification to the final plan", async () => {
    const restore = silenceConsole();
    const specification = {
      summary: "Balanced vegetarian menu",
      dietaryPattern: "vegetarian",
      goals: ["variety"],
      allergens: [],
      excludedIngredients: ["meat"],
      recommendations: ["Use varied plant proteins"],
    };
    const { client } = fakeClient({
      output_parsed: {
        menu: demoPlan.menu,
        recipes: demoPlan.recipes,
        shoppingList: demoPlan.shoppingList,
      },
    });

    try {
      const finalPlan = await createShoppingList(
        client,
        { menu: demoPlan.menu, recipes: demoPlan.recipes },
        specification,
      );

      expect(finalPlan.nutritionSpecification).toEqual(specification);
    } finally {
      restore();
    }
  });
});
