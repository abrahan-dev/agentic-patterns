import type { FinalPlan, MealType } from "../domain/schemas.ts";

const dishes = [
  ["2026-08-03", "Monday", "Greek lentil salad"],
  ["2026-08-04", "Tuesday", "Mediterranean chickpea bowl"],
  ["2026-08-05", "Wednesday", "Tomato and herb baked fish"],
  ["2026-08-06", "Thursday", "Spinach and feta frittata"],
  ["2026-08-07", "Friday", "Whole-wheat vegetable couscous"],
  ["2026-08-08", "Saturday", "White bean and kale stew"],
  ["2026-08-09", "Sunday", "Lemon chicken with roasted vegetables"],
] as const;

export const demoPlan: FinalPlan = {
  menu: {
    title: "Mediterranean weekly menu",
    startsOn: "2026-08-03",
    summary:
      "A balanced Mediterranean lunch menu built around vegetables, legumes, whole grains, and varied protein sources.",
    days: dishes.map(([date, dayName, dish]) => ({
      date,
      dayName,
      meals: [
        {
          type: "lunch" as MealType,
          dish,
          description: "A balanced Mediterranean lunch with vegetables and protein.",
        },
      ],
    })),
  },
  recipes: dishes.map(([date, , dish]) => ({
    date,
    mealType: "lunch",
    dish,
    ingredients: [
      { name: "seasonal vegetables", quantity: "250 g" },
      { name: "extra-virgin olive oil", quantity: "1 tbsp" },
      { name: "Mediterranean herbs", quantity: "1 tsp" },
    ],
    steps: [
      "Prepare the vegetables and main protein for the dish.",
      "Cook gently with olive oil and herbs until tender.",
      "Season to taste and serve warm.",
    ],
  })),
  shoppingList: [
    {
      section: "Produce",
      items: [{ name: "seasonal vegetables", quantity: "1.75 kg" }],
    },
    {
      section: "Pantry",
      items: [
        { name: "extra-virgin olive oil", quantity: "7 tbsp" },
        { name: "Mediterranean herbs", quantity: "7 tsp" },
      ],
    },
  ],
  nutritionSpecification: {
    summary:
      "Prioritize varied vegetables, legumes, whole grains, and balanced protein throughout the week.",
    dietaryPattern: "Mediterranean",
    goals: ["balanced everyday nutrition", "variety across the week"],
    allergens: [],
    excludedIngredients: [],
    recommendations: [
      "Use extra-virgin olive oil as the primary added fat",
      "Combine plant and animal protein sources across the week",
    ],
  },
};
