import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type { MealPlanRequest, MealType, RecipeDetail } from "../domain/schemas.ts";

const cli = createInterface({ input: stdin, output: stdout });

async function askYesNo(question: string, defaultValue = false): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await cli.question(`${question} (${hint}) `)).trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return answer === "y" || answer === "yes";
}

async function askStartDate(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  while (true) {
    const answer =
      (await cli.question(`When does the week start? [${today}] `)).trim() || today;
    const parsed = new Date(`${answer}T00:00:00Z`);

    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === answer) {
      return answer;
    }

    console.log("Enter a real date in YYYY-MM-DD format.");
  }
}

async function askMealTypes(): Promise<MealType[]> {
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

  return mealTypes;
}

async function askRecipeDetail(): Promise<RecipeDetail> {
  while (true) {
    const answer = (
      await cli.question("Do you prefer concise or detailed recipes? [concise] ")
    )
      .trim()
      .toLowerCase();

    if (!answer || answer === "concise") {
      return "concise";
    }

    if (answer === "detailed") {
      return "detailed";
    }

    console.log('Enter "concise" or "detailed".');
  }
}

export async function askMealPlanRequest(): Promise<MealPlanRequest> {
  console.log("\nWeekly request");
  const startsOn = await askStartDate();
  const mealTypes = await askMealTypes();
  const restrictions = (
    await cli.question("Any dietary restrictions or preferences? [none] ")
  ).trim();
  const cuisine = (
    await cli.question("Any preferred cuisine or cooking style? [varied] ")
  ).trim();
  const recipeDetail = await askRecipeDetail();

  return {
    week: { startsOn, mealTypes },
    food: {
      restrictions: restrictions || "none",
      cuisine: cuisine || "varied",
    },
    recipeDetail,
  };
}

export function closeQuestions(): void {
  cli.close();
}
