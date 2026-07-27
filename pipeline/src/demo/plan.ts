import type { FinalPlan } from "../domain/schemas.ts";

export const demoPlan: FinalPlan = {
  menu: {
    title: "A Mediterranean week",
    startsOn: "2026-07-27",
    days: [
      ["2026-07-27", "Monday", "Chickpea salad"],
      ["2026-07-28", "Tuesday", "Vegetable rice"],
      ["2026-07-29", "Wednesday", "Baked salmon"],
      ["2026-07-30", "Thursday", "Tomato and basil pasta"],
      ["2026-07-31", "Friday", "Courgette omelette"],
      ["2026-08-01", "Saturday", "Lemon chicken"],
      ["2026-08-02", "Sunday", "Vegetable lentil stew"],
    ].map(([date, dayName, dish]) => ({
      date: date!,
      dayName: dayName!,
      meals: [
        {
          type: "lunch" as const,
          dish: dish!,
          description: "A simple, balanced home-cooked dish.",
        },
      ],
    })),
  },
  recipes: [
    {
      date: "2026-07-27",
      mealType: "lunch",
      dish: "Chickpea salad",
      ingredients: [
        { name: "cooked chickpeas", quantity: "200 g" },
        { name: "tomato", quantity: "1" },
        { name: "cucumber", quantity: "1/2" },
      ],
      steps: [
        "Wash and chop the vegetables.",
        "Combine them with the chickpeas and dress the salad.",
      ],
    },
  ],
  shoppingList: [
    {
      section: "Produce",
      items: [
        { name: "tomatoes", quantity: "6" },
        { name: "cucumber", quantity: "1" },
        { name: "courgettes", quantity: "2" },
        { name: "lemons", quantity: "2" },
      ],
    },
    {
      section: "Tinned goods and pulses",
      items: [
        { name: "cooked chickpeas", quantity: "1 tin" },
        { name: "lentils", quantity: "250 g" },
      ],
    },
  ],
};
