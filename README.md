# Agentic Patterns

This repository is a hands-on lab for experimenting with AI and LLM application
patterns. Each directory contains a small, runnable example designed to test a
specific way of structuring prompts, context, model calls, validation, and
application flow.

The goal is not to provide production-ready frameworks. It is to make each
pattern easy to inspect, run, modify, and compare while learning where it works,
where it breaks down, and what trade-offs it introduces.

## Patterns

| Pattern | Description | Example |
| --- | --- | --- |
| Pipeline | Runs a sequence of specialized LLM stages where each stage receives the structured output of the previous one. | [Weekly meal plan](./pipeline/) |

More patterns will be added as the repository evolves.

## Working with the examples

Each pattern is self-contained and includes its own setup instructions,
configuration, tests, and documentation. Open the linked example above to get
started.
