# Agentic Patterns

In this repository, I build small code examples to experiment with patterns for
AI applications.

## Patterns

| Pattern              | Description                                                  | Example                                                 |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Pipeline             | Passes the output of one LLM step to the next.               | [Weekly meal plan](./pipeline/)                         |
| Router               | Sends a request to the best-matching specialized agent.      | [Routed meal plan](./router/)                           |
| Orchestrator–Workers | Plans globally, fans out execution, and synthesizes results. | [Parallel meal plan](./orchestrator-workers/)           |
| Web App Dev Team     | Routes seven specialized roles through validated handoffs.   | [Enterprise web app delivery team](./web-app-dev-team/) |

## Commands

Install all workspace dependencies:

```bash
bun install
```

Create the shared environment file and add your OpenAI API key:

```bash
cp .env.example .env
```

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

`ROUTER_CONFIDENCE_THRESHOLD` applies to the router example and accepts a value
from `0` to `1`. Router decisions below that confidence ask the user to clarify
their answer. The default is `0.65`.

The orchestrator and worker settings apply only to the orchestrator–workers
example. They deliberately assign different model and reasoning tiers to the
global planning/synthesis role and the parallel recipe workers.

The root `.env` is shared by all examples and is ignored by Git. Never commit
your API key.

Run formatting, linting, type checks, and tests for every pattern:

```bash
bun run check
```
