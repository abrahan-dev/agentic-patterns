# Orchestrator–Workers: Weekly Meal Plan

An educational fan-out/fan-in example built with Bun, TypeScript, Zod, and the
OpenAI Responses API. A capable orchestrator makes the global decisions while
lower-cost workers perform the verbose, parallelizable work.

1. The orchestrator sees the complete request and chooses every dish for the
   week. A contract rejects duplicate dish names and any changed calendar slot.
2. The application derives one immutable recipe task per day.
3. A concurrency-limited worker pool creates the seven daily recipe sets in
   parallel. Workers cannot rename or replace their assigned dishes.
4. The orchestrator returns after every worker succeeds and consolidates the
   ingredients into a shopping list.
5. Application code assembles the final result, so synthesis cannot silently
   rewrite the menu or recipes.

```text
request -> orchestrator.plan -> day tasks -> worker pool -> orchestrator.synthesize
                                      |       |       |
                                   Monday  Tuesday  ... Sunday
```

## Why the orchestrator chooses the dishes

Workers only see one day to keep their prompts small. If they also chose dishes,
they could independently produce the same meal. The orchestrator sees the whole
week and owns diversity; workers expand an already closed menu into recipes.

## Observability and failure policy

The CLI logs when each call starts and completes, its model, reasoning effort,
duration, reasoning-token count, retry attempt, and peak worker concurrency. It
does not display private chain-of-thought. The final summary reports token usage
instead of embedding model prices that would become stale.

Workers are attempted twice by default. Only the failed day is retried. The pool
waits for every in-flight worker, and synthesis does not run if any task exhausts
its retries.

## Configuration

Complete the shared setup in the [repository README](../README.md), then add or
adjust these values in the root `.env`:

```dotenv
OPENAI_ORCHESTRATOR_MODEL=gpt-5.6-sol
OPENAI_ORCHESTRATOR_REASONING_EFFORT=medium
OPENAI_WORKER_MODEL=gpt-5.6-terra
OPENAI_WORKER_REASONING_EFFORT=low
WORKER_CONCURRENCY=3
WORKER_MAX_ATTEMPTS=2
```

## Usage

Run the interactive example from its workspace:

```bash
cd orchestrator-workers
bun run start
```

The API-free demo runs the real orchestration code with deterministic fake
agents and different simulated delays, making the fan-out visible in the CLI:

```bash
bun run --filter orchestrator-workers demo
```

Append `--no-open` when running `src/index.ts` directly in CI or when only the
terminal trace and generated file are needed.

Checks:

```bash
bun run check
```
