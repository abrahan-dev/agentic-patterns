# LLM Pipeline: Weekly Meal Plan

An educational example of a linear pipeline built with Bun, TypeScript 7, and
the OpenAI Responses API. Each stage has its own prompt and Zod schema, and its
structured output becomes the input for the next stage:

1. Create the weekly meal plan skeleton.
2. Fill each meal slot with a dish.
3. Add a recipe for every dish.
4. Consolidate the shopping list by supermarket section.

Before each of the first three stages, the CLI asks only for the context needed
by that stage. The result is written to `output/weekly-menu.html` and opened in
the default browser.

In addition to validating data shapes with Zod, contracts between stages ensure
that a stage cannot silently rewrite previous work—for example, changing a date
while adding recipes.

## Project structure

```text
src/
├── index.ts                 # Composition root and linear orchestration
├── config.ts                # Environment configuration
├── domain/
│   ├── schemas.ts           # Zod schemas and TypeScript types
│   └── contracts.ts         # Invariants between stages
├── pipeline/
│   ├── stages.ts            # The four OpenAI stages
│   └── prompts.ts           # Prompts for each stage
├── cli/
│   └── questions.ts         # Interactive user input
├── output/
│   ├── render-html.ts       # HTML generation
│   └── open-browser.ts      # Browser adapter
└── demo/
    └── plan.ts              # Local demo fixture
```

## Setup

```bash
bun install
cp .env.example .env
```

Edit `.env` and add your `OPENAI_API_KEY`. Bun loads this file automatically.
`OPENAI_MODEL` and `OPENAI_REASONING_EFFORT` can be used to tune cost and
reasoning depth without changing the source code.

## Usage

```bash
bun run start
```

To test the HTML without an API key or API calls:

```bash
bun run demo
```

Checks:

```bash
bun run format:check
bun run typecheck
bun test
```

To apply formatting and automatic lint fixes:

```bash
bun run format
```

The style rules require braces around control-flow blocks and a blank line
before `return` statements when another statement precedes them.

Type checking still runs on TypeScript 7. TypeScript 5 is installed only as a
compatibility API for lint tooling that does not yet support the TypeScript 7
compiler API.

The example configuration uses `gpt-5.4-mini` with `low` reasoning effort.
Supported reasoning-effort values for this model are `none`, `low`, `medium`,
`high`, and `xhigh`.
