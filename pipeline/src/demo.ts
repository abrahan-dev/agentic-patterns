import type { FinalPlan } from "./schemas.ts";

export const demoPlan: FinalPlan = {
  menu: {
    title: "Una semana mediterránea",
    startsOn: "2026-07-27",
    days: [
      ["2026-07-27", "lunes", "Ensalada de garbanzos"],
      ["2026-07-28", "martes", "Arroz con verduras"],
      ["2026-07-29", "miércoles", "Salmón al horno"],
      ["2026-07-30", "jueves", "Pasta con tomate y albahaca"],
      ["2026-07-31", "viernes", "Tortilla de calabacín"],
      ["2026-08-01", "sábado", "Pollo al limón"],
      ["2026-08-02", "domingo", "Lentejas con verduras"],
    ].map(([date, dayName, dish]) => ({
      date: date!,
      dayName: dayName!,
      meals: [
        {
          type: "comida" as const,
          dish: dish!,
          description: "Un plato casero, equilibrado y sencillo.",
        },
      ],
    })),
  },
  recipes: [
    {
      date: "2026-07-27",
      mealType: "comida",
      dish: "Ensalada de garbanzos",
      ingredients: [
        { name: "garbanzos cocidos", quantity: "200 g" },
        { name: "tomate", quantity: "1 unidad" },
        { name: "pepino", quantity: "1/2 unidad" },
      ],
      steps: ["Lava y corta las verduras.", "Mezcla con los garbanzos y aliña."],
    },
  ],
  shoppingList: [
    {
      section: "Fruta y verdura",
      items: [
        { name: "tomate", quantity: "6 unidades" },
        { name: "pepino", quantity: "1 unidad" },
        { name: "calabacín", quantity: "2 unidades" },
        { name: "limón", quantity: "2 unidades" },
      ],
    },
    {
      section: "Conservas y legumbres",
      items: [
        { name: "garbanzos cocidos", quantity: "1 bote" },
        { name: "lentejas", quantity: "250 g" },
      ],
    },
  ],
};
