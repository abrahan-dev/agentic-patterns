import type {
  DayContribution,
  DayTask,
  MealPlanRequest,
  PlannedMenu,
} from "../domain/schemas.ts";

function calendar(request: MealPlanRequest): Array<{
  date: string;
  dayName: string;
  mealTypes: MealPlanRequest["week"]["mealTypes"];
}> {
  const start = new Date(`${request.week.startsOn}T00:00:00Z`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      date: date.toISOString().slice(0, 10),
      dayName: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "UTC",
      }).format(date),
      mealTypes: request.week.mealTypes,
    };
  });
}

export function plannerPrompt(request: MealPlanRequest): string {
  return `Design the complete weekly menu before any recipe worker starts.

Success criteria:
- preserve the exact calendar and meal slots below
- choose a distinct dish for every slot across the entire week
- avoid semantically equivalent dishes with slightly different names
- create variety in primary ingredients, cooking methods, colors, and cuisines
- respect the user's restrictions and cuisine preference
- descriptions should be one concise sentence
- do not write recipes or ingredient lists

CALENDAR:
${JSON.stringify(calendar(request), null, 2)}

FOOD PREFERENCES:
${JSON.stringify(request.food, null, 2)}`;
}

export function workerPrompt(task: DayTask): string {
  return `Create one recipe for every assigned dish in this immutable daily task.

Success criteria:
- preserve taskId, date, meal type, dish name, and recipe order exactly
- do not add, remove, rename, or replace dishes
- respect the dietary restrictions
- quantities should be practical for two people
- ${task.recipeDetail === "detailed" ? "provide clear, detailed cooking steps" : "provide short, concise cooking steps"}

TASK:
${JSON.stringify(task, null, 2)}`;
}

export function synthesisPrompt(
  menu: PlannedMenu,
  contributions: DayContribution[],
): string {
  return `Consolidate the ingredients from all worker recipes into one shopping list.

Success criteria:
- combine equivalent ingredients and quantities when practical
- organize items by familiar supermarket sections
- include every ingredient needed by the recipes
- do not return or rewrite the menu or recipes

MENU:
${JSON.stringify(menu, null, 2)}

WORKER CONTRIBUTIONS:
${JSON.stringify(contributions, null, 2)}`;
}
