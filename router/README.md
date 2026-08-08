# LLM Router: Weekly Meal Plan

This example uses Bun, TypeScript 7, Zod, and the OpenAI Responses API. The
application creates a weekly menu in five stages:

1. A general agent creates the weekly structure.
2. A nutrition router selects a nutrition specialist.
3. A cuisine router selects a cook.
4. The selected cook creates recipes.
5. A general agent creates the shopping list.

## Routers and agents

The nutrition router receives the user's answer about diet, allergies,
restrictions, and goals. It can select:

- `nutritionist`
- `plant_based_nutritionist`
- `fallback`

The cuisine router receives the user's cooking-style preference. It can select:

- `mediterranean_cook`
- `asian_cook`
- `general_cook`
- `fallback`

The `general_cook` handles valid cuisines that do not have a specialist. These
cuisines can include Mexican, Italian, French, and Middle Eastern food.

The `fallback` handles an answer that is not a cooking style. It does not stop
the workflow. It explains the mismatch, and the CLI asks the question again.

Each router decision contains a destination, a confidence value, and a reason.
The confidence value is from `0` through `1`.

```ts
{
  destination:
    | "nutritionist"
    | "plant_based_nutritionist"
    | "mediterranean_cook"
    | "asian_cook"
    | "general_cook"
    | "fallback";
  confidence: number;
  reason: string;
}
```

If confidence is below `ROUTER_CONFIDENCE_THRESHOLD`, the CLI asks for more
information. The default threshold is `0.65`.

## Flow

```text
Stage 1 ──> general agent ─────────────────────────────> menu structure

Stage 2 ──> nutrition router ─┬─> nutritionist ─────────> nutrition specification
                              ├─> plant specialist ─────> nutrition specification
                              └─> fallback ─────────────> explanation and retry

Stage 3 ──> cuisine router ───┬─> Mediterranean cook ──> dishes
                              ├─> Asian cook ───────────> dishes
                              ├─> general cook ─────────> dishes
                              └─> fallback ─────────────> explanation and retry

Stage 4 ──> selected cook ─────────────────────────────> recipes
Stage 5 ──> general agent ─────────────────────────────> shopping list
```

The selected cook also supplies a one-sentence menu summary. The final HTML
uses this summary as its subtitle. It also shows the nutrition specification.

The router classifies only the user answer. It does not receive the application
instructions or prior results. The selected specialist receives that context
after routing.

Stage 1 accepts valid `YYYY-MM-DD` dates and exact yes-or-no answers. Stage 4
accepts `concise`, `detailed`, or an empty answer. An empty answer selects
`concise`.

Contracts make sure that the seven-day structure has the requested dates and
meal positions. A deterministic check also compares recipe ingredients with
the specified allergens and exclusions.

This check is an example guardrail. It is not a production allergy-safety
control.

## Project structure

```text
src/
├── index.ts
├── config.ts
├── agents/
│   ├── catalog.ts          # Defines the agent groups for each stage
│   └── run-agent.ts        # Runs an agent or the shared fallback
├── router/
│   └── router.ts           # Applies candidate and confidence rules
├── pipeline/
│   ├── stages.ts           # Controls the five stages and retries
│   └── prompts.ts
├── domain/                 # Contains schemas and stage contracts
├── cli/                    # Gets validated user input
├── output/                 # Creates HTML and opens the browser
└── demo/                   # Contains the local demo data
```

## Usage

Complete the setup in the [repository README](../README.md). Then set the router
threshold if necessary:

```dotenv
ROUTER_CONFIDENCE_THRESHOLD=0.65
```

Run the interactive example:

```bash
cd router
bun run start
```

Run the local demo and all checks:

```bash
bun run --filter router demo
bun run check
```

The CLI shows the candidates, destination, confidence, reason, and fallback
override for each router call.

The router and pipeline examples use the same HTML renderer. Thus, the examples
have the same visual design.
