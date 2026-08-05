import type { AgentResult, AgentRunner, TokenUsage } from "../agents/contracts.ts";
import type {
  DayContribution,
  DayTask,
  MealPlanRequest,
  MealType,
  PlannedMenu,
  ShoppingSynthesis,
} from "../domain/schemas.ts";

const dishes: Record<MealType, string[]> = {
  breakfast: [
    "Pear and walnut porridge",
    "Spinach mushroom omelette",
    "Berry yogurt granola",
    "Tomato ricotta toast",
    "Apple cinnamon overnight oats",
    "Herbed chickpea scramble",
    "Banana buckwheat pancakes",
  ],
  lunch: [
    "Lemon lentil tabbouleh",
    "Roasted vegetable soba bowl",
    "White bean tomato stew",
    "Sweet potato black bean tacos",
    "Herbed salmon quinoa salad",
    "Ginger tofu rice bowl",
    "Mushroom barley risotto",
  ],
  snack: [
    "Paprika hummus with vegetables",
    "Cocoa date energy bites",
    "Peach chia cup",
    "Rosemary seed crackers",
    "Mango lime yogurt",
    "Roasted spiced chickpeas",
    "Baked apple with tahini",
  ],
  dinner: [
    "Baked hake with fennel",
    "Coconut vegetable curry",
    "Chicken and apricot tagine",
    "Eggplant miso noodles",
    "Turkey stuffed peppers",
    "Red lentil shepherd pie",
    "Mediterranean vegetable galette",
  ],
};

const usage = (
  inputTokens: number,
  outputTokens: number,
  reasoningTokens: number,
): TokenUsage => ({
  inputTokens,
  outputTokens,
  reasoningTokens,
  totalTokens: inputTokens + outputTokens,
});

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class FakeAgentRunner implements AgentRunner {
  readonly models = {
    orchestrator: "fake-orchestrator",
    worker: "fake-worker",
  };

  constructor(private readonly delays = [360, 140, 280, 180, 320, 120, 240]) {}

  async plan(request: MealPlanRequest): Promise<AgentResult<PlannedMenu>> {
    await wait(180);
    const start = new Date(`${request.week.startsOn}T00:00:00Z`);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);

      return {
        date: date.toISOString().slice(0, 10),
        dayName: new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone: "UTC",
        }).format(date),
        meals: request.week.mealTypes.map((type) => ({
          type,
          dish: dishes[type][index]!,
          description: `A varied ${type} selected with the whole week in view.`,
        })),
      };
    });

    return {
      value: {
        title: "Parallel weekly table",
        summary: "A varied week planned globally and expanded by daily recipe workers.",
        startsOn: request.week.startsOn,
        days,
      },
      usage: usage(620, 410, 190),
    };
  }

  async execute(task: DayTask): Promise<AgentResult<DayContribution>> {
    const index = Number(task.id.split("-")[1]) - 1;
    await wait(this.delays[index] ?? 100);

    return {
      value: {
        taskId: task.id,
        date: task.day.date,
        recipes: task.day.meals.map((meal) => ({
          date: task.day.date,
          mealType: meal.type,
          dish: meal.dish,
          ingredients: [
            { name: `main ingredients for ${meal.dish}`, quantity: "2 servings" },
            { name: "extra virgin olive oil", quantity: "1 tbsp" },
          ],
          steps: [
            `Prepare the ingredients for ${meal.dish}.`,
            "Cook until ready and season to taste.",
          ],
        })),
      },
      usage: usage(180, 230, 35),
    };
  }

  async synthesize(
    _menu: PlannedMenu,
    contributions: DayContribution[],
  ): Promise<AgentResult<ShoppingSynthesis>> {
    await wait(160);
    const recipeItems = contributions.flatMap((contribution) =>
      contribution.recipes.map((recipe) => ({
        name: `Ingredients for ${recipe.dish}`,
        quantity: "2 servings",
      })),
    );

    return {
      value: {
        shoppingList: [
          { section: "Recipe ingredients", items: recipeItems },
          {
            section: "Pantry",
            items: [{ name: "Extra virgin olive oil", quantity: "7 tbsp" }],
          },
        ],
      },
      usage: usage(980, 250, 120),
    };
  }
}
