# Agentic Patterns

This repository contains small examples of agentic patterns for AI applications.

## Patterns

| Pattern              | Description                                                         | Example                                        |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| Pipeline             | Sends the output of one LLM stage to the next stage.                | [Weekly meal plan](./pipeline/)                |
| Router               | Sends a request to the applicable specialist agent.                 | [Routed meal plan](./router/)                  |
| Orchestrator–Workers | Plans the work, runs workers in parallel, and combines the results. | [Parallel meal plan](./orchestrator-workers/)  |
| Web App Dev Team     | Sends work through seven roles with validated handoffs.             | [Enterprise web app team](./web-app-dev-team/) |

## Setup

Install the workspace dependencies:

```bash
bun install
```

Create the shared environment file:

```bash
cp .env.example .env
```

Add your OpenAI API key and configuration:

```dotenv
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-5.4-mini
OPENAI_REASONING_EFFORT=low
ROUTER_CONFIDENCE_THRESHOLD=0.65
OPENAI_ORCHESTRATOR_MODEL=gpt-5.6-sol
OPENAI_ORCHESTRATOR_REASONING_EFFORT=medium
OPENAI_WORKER_MODEL=gpt-5.6-terra
OPENAI_WORKER_REASONING_EFFORT=low
WORKER_CONCURRENCY=3
WORKER_MAX_ATTEMPTS=2
```

`ROUTER_CONFIDENCE_THRESHOLD` applies only to the router example. Use a value
from `0` through `1`. The default value is `0.65`.

The orchestrator and worker variables apply only to the orchestrator–workers
example. They let the two agent types use different models and reasoning levels.

All examples use the root `.env` file. Git ignores this file. Do not commit your
API key.

Run all checks:

```bash
bun run check
```
