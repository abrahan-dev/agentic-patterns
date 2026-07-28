import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type {
  FoodPreferences,
  MealType,
  RecipeDetail,
  WeekPreferences,
} from "../domain/schemas.ts";

const cli = createInterface({ input: stdin, output: stdout });

async function askYesNo(question: string, defaultValue = false): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await cli.question(`${question} (${hint}) `)).trim().toLowerCase();
  if (!answer) {
    return defaultValue;
  }

  return answer === "y" || answer === "yes";
}

export async function askWeekPreferences(): Promise<WeekPreferences> {
  console.log("\nStage 1 · Weekly structure");
  const today = new Date().toISOString().slice(0, 10);
  const startsOn =
    (await cli.question(`When does the week start? [${today}] `)).trim() || today;

  const mealTypes: MealType[] = [];
  if (await askYesNo("Include breakfast?")) {
    mealTypes.push("breakfast");
  }
  mealTypes.push("lunch");
  if (await askYesNo("Include an afternoon snack?")) {
    mealTypes.push("snack");
  }
  if (await askYesNo("Include dinner?", true)) {
    mealTypes.push("dinner");
  }

  return { startsOn, mealTypes };
}

export async function askFoodPreferences(): Promise<FoodPreferences> {
  console.log("\nStage 2 · Dish selection");
  const restrictions = await cli.question(
    "Any dietary restrictions or preferences? [none] ",
  );

  return { restrictions: restrictions.trim() };
}

export async function askRecipeDetail(): Promise<RecipeDetail> {
  console.log("\nStage 3 · Recipes");
  const answer = (
    await cli.question("Do you prefer concise or detailed recipes? [concise] ")
  )
    .trim()
    .toLowerCase();

  return answer.startsWith("d") ? "detailed" : "concise";
}

export function closeQuestions(): void {
  cli.close();
}
