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
bun run typecheck
bun test
```

The example configuration uses `gpt-5.4-mini` with `low` reasoning effort.
Supported reasoning-effort values for this model are `none`, `low`, `medium`,
`high`, and `xhigh`.
