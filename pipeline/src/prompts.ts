import type {
  FoodPreferences,
  MenuSkeleton,
  MenuWithRecipes,
  PlannedMenu,
  RecipeDetail,
  WeekPreferences,
} from "./schemas.ts";

const JSON_CONTEXT = (value: unknown) => JSON.stringify(value, null, 2);

export function schemaPrompt(preferences: WeekPreferences): string {
  return `Crea la estructura de un menú semanal de exactamente siete días.
La semana empieza el ${preferences.startsOn}.
Cada día debe contener exactamente estas tomas, en este orden: ${preferences.mealTypes.join(", ")}.
Esta etapa solo crea el calendario y los huecos: no inventes platos todavía.`;
}

export function dishesPrompt(
  skeleton: MenuSkeleton,
  preferences: FoodPreferences,
): string {
  return `Rellena cada hueco del menú con un plato concreto, variado y realista.
Respeta literalmente fechas, días y tipos de comida del esquema recibido.
Restricciones o preferencias alimentarias: ${preferences.restrictions || "ninguna"}.
Evita repeticiones innecesarias y procura reutilizar ingredientes para reducir desperdicio.

ESQUEMA DE ENTRADA:
${JSON_CONTEXT(skeleton)}`;
}

export function recipesPrompt(
  menu: PlannedMenu,
  detail: RecipeDetail,
): string {
  return `Añade una receta para cada plato del menú.
Las recetas deben ser ${detail}, domésticas y posibles con equipamiento habitual.
Conserva el menú recibido sin modificarlo. Cada receta debe poder vincularse por fecha, tipo de comida y plato.
Da cantidades útiles para una persona; la lista de compra posterior las consolidará.

MENÚ DE ENTRADA:
${JSON_CONTEXT(menu)}`;
}

export function shoppingPrompt(plan: MenuWithRecipes): string {
  return `Genera la lista de la compra completa a partir de todas las recetas.
Conserva sin cambios el menú y las recetas de entrada.
Agrupa y suma ingredientes equivalentes, usa cantidades prácticas y clasifica los artículos
por secciones habituales de un hipermercado español (fruta y verdura, carnicería, lácteos, etc.).
No incluyas utensilios ni ingredientes que no aparezcan en las recetas.

PLAN CON RECETAS:
${JSON_CONTEXT(plan)}`;
}
