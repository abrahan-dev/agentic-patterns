# Agentic Patterns

In this repository, I build small code examples to experiment with patterns for
AI applications.

## Patterns

| Pattern  | Description                                    | Example                         |
| -------- | ---------------------------------------------- | ------------------------------- |
| Pipeline | Passes the output of one LLM step to the next. | [Weekly meal plan](./pipeline/) |

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
```

The root `.env` is shared by all examples and is ignored by Git. Never commit
your API key.

Run formatting, linting, type checks, and tests for every pattern:

```bash
bun run check
```
