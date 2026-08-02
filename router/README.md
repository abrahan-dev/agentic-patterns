# LLM Router: Weekly Meal Plan

An educational multi-router pattern built with Bun, TypeScript 7, Zod, and the
OpenAI Responses API. The application creates a weekly menu in five stages:

1. A general agent creates the validated weekly structure.
2. A nutrition router selects a nutritionist, which produces a specification
   rather than dishes.
3. A cuisine router selects a cook, which fills the menu while respecting the
   nutrition specification.
4. The selected cook creates concise or detailed recipes.
5. A general agent consolidates the shopping list.

## Routers and agents

The nutrition router receives only the user's raw answer about diet, allergies,
restrictions, or goals. It can select:

- `nutritionist`
- `plant_based_nutritionist`
- `fallback`

The cuisine router receives only the user's raw cooking-style preference. It
can select:

- `mediterranean_cook`
- `asian_cook`
- `general_cook`
- `fallback`

Every decision contains a destination, confidence from `0` to `1`, and a
reason. Confidence below `0.65`, an unrelated message, or an agent unavailable
in the current stage results in the shared fallback.

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

The fallback is non-terminal. It identifies the answer's actual topic, explains
why it does not match the current question, and the CLI asks that question
again. For example, a payment complaint entered as a dietary preference does
not stop the complete workflow.

## Flow

```text
Stage 1 ──> general agent ─────────────────────────────> menu skeleton

Stage 2 ──> nutrition router ─┬─> general nutritionist ─> nutrition spec
                              ├─> plant-based specialist ─> nutrition spec
                              └─> fallback ──────────────> explain + retry

Stage 3 ──> cuisine router ───┬─> Mediterranean cook ───> dishes
                              ├─> Asian cook ────────────> dishes
                              ├─> general cook ──────────> dishes
                              └─> fallback ──────────────> explain + retry

Stage 4 ──> selected cook ─────────────────────────────> recipes
Stage 5 ──> general agent ─────────────────────────────> shopping list
```

Only raw user answers are classified. Full stage instructions, the menu
skeleton, and prior structured results are supplied after routing to the chosen
specialist. This avoids biasing a router with application context.

Stage 1 validates real `YYYY-MM-DD` dates and exact yes/no responses. Stage 4
accepts only `concise`, `detailed`, or an empty answer for the concise default;
invalid input repeats the question without an API call.

## Project structure

```text
src/
├── index.ts
├── config.ts
├── agents/
│   ├── catalog.ts          # Stage-specific agent groups
│   └── run-agent.ts        # Structured agent and shared fallback execution
├── router/
│   └── router.ts           # Decision, candidate filtering, confidence policy
├── pipeline/
│   ├── stages.ts           # Five-stage composition and retry results
│   └── prompts.ts
├── domain/                 # Schemas and cross-stage contracts
├── cli/                    # Validated interactive questions
├── output/                 # Shared pipeline presentation and browser adapter
└── demo/                   # API-free fixture
```

## Usage

Install and configure the repository as described in the
[root README](../README.md), then run:

```bash
cd router
bun run start
```

API-free demo and repository checks:

```bash
bun run --filter router demo
bun run check
```

Router calls log their stage candidates, chosen destination, confidence, reason,
and any fallback override. The router example deliberately reuses the pipeline
HTML renderer so both patterns keep the same visual presentation.
