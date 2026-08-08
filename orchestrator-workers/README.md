# Orchestrator–Workers: Weekly Meal Plan

This example uses Bun, TypeScript, Zod, and the OpenAI Responses API. An
orchestrator controls the complete plan. Lower-cost workers create recipes in
parallel.

1. The orchestrator selects all dishes for the week.
2. The application creates one fixed recipe task for each day.
3. The worker pool creates the seven daily recipe groups.
4. The orchestrator combines the ingredients into a shopping list.
5. The application assembles the final result.

Contracts reject duplicate dish names and changed calendar positions. A worker
cannot change its assigned dishes. The synthesis step cannot change the menu or
the recipes.

```text
request -> orchestrator.plan -> day tasks -> worker pool -> orchestrator.synthesize
                                      |       |       |
                                   Monday  Tuesday  ... Sunday
```

## Dish selection

Each worker receives one day. This keeps the worker prompts small. The
orchestrator receives the complete week and prevents duplicate dishes.

## Logs and failures

The CLI shows the start and end of each call. It also shows the model, reasoning
effort, duration, token count, retry number, and maximum worker concurrency.

The CLI does not show private chain-of-thought. The final summary shows token
use. It does not contain model prices because prices can change.

By default, the application tries each failed worker two times. It tries only
the failed day again. Synthesis starts only after all workers are successful.

## Configuration

Complete the setup in the [repository README](../README.md). Then set these
variables in the root `.env` file:

```dotenv
OPENAI_ORCHESTRATOR_MODEL=gpt-5.6-sol
OPENAI_ORCHESTRATOR_REASONING_EFFORT=medium
OPENAI_WORKER_MODEL=gpt-5.6-terra
OPENAI_WORKER_REASONING_EFFORT=low
WORKER_CONCURRENCY=3
WORKER_MAX_ATTEMPTS=2
```

## Usage

Run the interactive example from this directory:

```bash
cd orchestrator-workers
bun run start
```

Run the local demo from the repository root:

```bash
bun run --filter orchestrator-workers demo
```

The demo uses deterministic agents and different simulated delays. The CLI
shows the parallel work.

Add `--no-open` when you run `src/index.ts` in CI. You can also use this option
when you only need the terminal output and generated file.

Run the checks:

```bash
bun run check
```
