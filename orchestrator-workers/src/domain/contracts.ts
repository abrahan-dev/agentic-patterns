import { isDeepStrictEqual } from "node:util";
import type {
  DayContribution,
  DayTask,
  MealPlanRequest,
  PlannedMenu,
} from "./schemas.ts";

function fail(stage: string, detail: string): never {
  throw new Error(`Contract violation in ${stage}: ${detail}`);
}

function expectedDays(request: MealPlanRequest): Array<{
  date: string;
  dayName: string;
  mealTypes: MealPlanRequest["week"]["mealTypes"];
}> {
  const start = new Date(`${request.week.startsOn}T00:00:00Z`);

  if (Number.isNaN(start.getTime())) {
    fail("orchestrator_plan", "the requested start date is invalid");
  }

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

function normalizeDish(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function assertPlanMatchesRequest(
  request: MealPlanRequest,
  menu: PlannedMenu,
): void {
  const expected = expectedDays(request);
  const received = menu.days.map((day) => ({
    date: day.date,
    dayName: day.dayName,
    mealTypes: day.meals.map((meal) => meal.type),
  }));

  if (menu.startsOn !== request.week.startsOn || !isDeepStrictEqual(received, expected)) {
    fail("orchestrator_plan", "dates, day names, or requested meal slots changed");
  }

  const dishes = menu.days.flatMap((day) => day.meals.map((meal) => meal.dish));
  const normalized = dishes.map(normalizeDish);
  const duplicate = normalized.find((dish, index) => normalized.indexOf(dish) !== index);

  if (duplicate) {
    fail("orchestrator_plan", `duplicate dish detected: ${duplicate}`);
  }
}

export function createDayTasks(request: MealPlanRequest, menu: PlannedMenu): DayTask[] {
  return menu.days.map((day, index) => ({
    id: `day-${index + 1}-${day.date}`,
    day,
    restrictions: request.food.restrictions,
    recipeDetail: request.recipeDetail,
  }));
}

export function assertContributionMatchesTask(
  task: DayTask,
  contribution: DayContribution,
): void {
  if (contribution.taskId !== task.id || contribution.date !== task.day.date) {
    fail("worker", `worker changed the identity of ${task.id}`);
  }

  const expected = task.day.meals.map(
    (meal) => `${task.day.date}|${meal.type}|${meal.dish}`,
  );
  const received = contribution.recipes.map(
    (recipe) => `${recipe.date}|${recipe.mealType}|${recipe.dish}`,
  );

  if (!isDeepStrictEqual(received, expected)) {
    fail("worker", `worker ${task.id} changed its assigned dishes or recipe order`);
  }
}
