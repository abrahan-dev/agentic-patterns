import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type {
  FoodPreferences,
  MealType,
  RecipeDetail,
  WeekPreferences,
} from "./schemas.ts";

const cli = createInterface({ input: stdin, output: stdout });

async function askYesNo(question: string, defaultValue = false): Promise<boolean> {
  const hint = defaultValue ? "S/n" : "s/N";
  const answer = (await cli.question(`${question} (${hint}) `)).trim().toLowerCase();
  if (!answer) return defaultValue;
  return answer === "s" || answer === "sí" || answer === "si";
}

export async function askWeekPreferences(): Promise<WeekPreferences> {
  console.log("\nPaso 1 · Estructura de la semana");
  const today = new Date().toISOString().slice(0, 10);
  const startsOn =
    (await cli.question(`¿Cuándo comienza la semana? [${today}] `)).trim() || today;

  const mealTypes: MealType[] = [];
  if (await askYesNo("¿Quieres incluir desayuno?")) mealTypes.push("desayuno");
  mealTypes.push("comida");
  if (await askYesNo("¿Quieres incluir merienda?")) mealTypes.push("merienda");
  if (await askYesNo("¿Quieres incluir cena?", true)) mealTypes.push("cena");

  return { startsOn, mealTypes };
}

export async function askFoodPreferences(): Promise<FoodPreferences> {
  console.log("\nPaso 2 · Selección de platos");
  const restrictions = await cli.question(
    "¿Tienes restricciones o preferencias alimentarias? [ninguna] ",
  );
  return { restrictions: restrictions.trim() };
}

export async function askRecipeDetail(): Promise<RecipeDetail> {
  console.log("\nPaso 3 · Recetas");
  const answer = (
    await cli.question("¿Prefieres recetas esquemáticas o detalladas? [esquemáticas] ")
  )
    .trim()
    .toLowerCase();
  return answer.startsWith("d") ? "detalladas" : "esquemáticas";
}

export function closeQuestions(): void {
  cli.close();
}
