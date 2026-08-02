import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import type {
  MealType,
  NutritionRequest,
  RecipeDetail,
  WeekPreferences,
} from "../domain/schemas.ts";

const cli = createInterface({ input: stdin, output: stdout });

export function parseIsoDateInput(
  input: string,
  defaultValue: string,
): string | undefined {
  const value = input.trim() || defaultValue;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? undefined
    : value;
}

export function parseYesNoInput(
  input: string,
  defaultValue: boolean,
): boolean | undefined {
  const answer = input.trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  if (answer === "y" || answer === "yes") {
    return true;
  }

  if (answer === "n" || answer === "no") {
    return false;
  }

  return undefined;
}

export function parseRecipeDetailInput(input: string): RecipeDetail | undefined {
  const answer = input.trim().toLowerCase();

  if (!answer || answer === "concise") {
    return "concise";
  }

  if (answer === "detailed") {
    return "detailed";
  }

  return undefined;
}

async function askYesNo(question: string, defaultValue = false): Promise<boolean> {
  const hint = defaultValue ? "Y/n" : "y/N";

  while (true) {
    const answer = await cli.question(`${question} (${hint}) `);
    const parsed = parseYesNoInput(answer, defaultValue);

    if (parsed !== undefined) {
      return parsed;
    }

    console.error("Invalid answer. Please enter y or n.");
  }
}

export async function askWeekPreferences(): Promise<WeekPreferences> {
  console.log("\nStage 1 · Weekly structure · direct general agent");
  const today = new Date().toISOString().slice(0, 10);
  let startsOn: string | undefined;

  while (!startsOn) {
    const answer = await cli.question(`When does the week start? [${today}] `);
    startsOn = parseIsoDateInput(answer, today);

    if (!startsOn) {
      console.error("Invalid date. Please enter a real date in YYYY-MM-DD format.");
    }
  }

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

export async function askNutritionRequest(): Promise<NutritionRequest> {
  console.log("\nStage 2 · Nutrition specification · routed");
  const message = await cli.question(
    "Describe your diet, allergies, restrictions, or nutrition goals. [none] ",
  );

  return { message: message.trim() };
}

export async function askCuisinePreference(): Promise<string> {
  console.log("\nStage 3 · Cuisine and dish selection · routed");

  return cli.question(
    "What cooking style would you like? Mediterranean, Asian, Mexican, or any other style. [general] ",
  );
}

export async function askRecipeDetail(): Promise<RecipeDetail> {
  console.log("\nStage 4 · Recipes · selected cook");

  while (true) {
    const answer = await cli.question(
      "Do you prefer concise or detailed recipes? [concise] ",
    );
    const detail = parseRecipeDetailInput(answer);

    if (detail) {
      return detail;
    }

    console.error('Invalid answer. Please enter exactly "concise" or "detailed".');
  }
}

export function closeQuestions(): void {
  cli.close();
}
