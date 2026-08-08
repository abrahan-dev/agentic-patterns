# LLM Pipeline: Weekly Meal Plan

This example uses Bun, TypeScript 7, Zod, and the OpenAI Responses API. It has a
linear pipeline with four stages:

1. Create the weekly menu structure.
2. Add one dish to each meal position.
3. Add one recipe for each dish.
4. Group the ingredients by supermarket section.

Each stage has a prompt and a Zod schema. The structured output of a stage is
the input to the next stage.

Before the first three stages, the CLI asks for the necessary information. The
application writes the result to `output/generated-weekly-menu.html`. It then
opens the file in the default browser.

Contracts protect the output of each completed stage. For example, the recipe
stage cannot change a date.

## Project structure

```text
src/
├── index.ts                 # Starts and controls the pipeline
├── config.ts                # Reads the environment configuration
├── domain/
│   ├── schemas.ts           # Defines Zod schemas and TypeScript types
│   └── contracts.ts         # Checks invariants between stages
├── pipeline/
│   ├── stages.ts            # Runs the four OpenAI stages
│   └── prompts.ts           # Defines the stage prompts
├── cli/
│   └── questions.ts         # Gets validated user input
├── output/
│   ├── render-html.ts       # Creates the HTML output
│   └── open-browser.ts      # Opens the browser
└── demo/
    └── plan.ts              # Contains the local demo data
```

## Setup

Complete the setup in the [repository README](../README.md). This example reads
these variables from the root `.env` file:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_REASONING_EFFORT`

## Usage

Run the interactive command from this directory:

```bash
cd pipeline
bun run start
```

Run the local demo from the repository root:

```bash
bun run --filter pipeline demo
```

The demo reads [`src/demo/plan.ts`](./src/demo/plan.ts). It writes the versioned
[`output/weekly-menu.html`](./output/weekly-menu.html). A live run uses a
different file name and does not replace the demo file.

Run the checks:

```bash
bun run check
```

Apply formatting and automatic lint corrections:

```bash
bun run format
```

The lint rules require braces around control-flow blocks. They also require
blank lines before blocks and `return` statements when applicable.

Type checking uses TypeScript 7. The lint tools use TypeScript 5 as a
compatibility API.

The example uses `gpt-5.4-mini` with `low` reasoning effort. The model also
accepts `none`, `medium`, `high`, and `xhigh`.
