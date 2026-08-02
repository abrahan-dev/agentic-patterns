import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ZodType } from "zod";
import { z } from "zod";
import { MODEL, REASONING_EFFORT } from "../config.ts";
import { agents, type AgentDefinition } from "./catalog.ts";

const fallbackResponseSchema = z.object({
  topic: z.string().describe("Short name for the request's main topic"),
  message: z
    .string()
    .describe("Brief explanation of why that topic does not match the current question"),
});

export type FallbackResponse = z.infer<typeof fallbackResponseSchema>;

export async function runStructuredAgent<T>(
  client: OpenAI,
  agent: AgentDefinition,
  stageName: string,
  prompt: string,
  schema: ZodType<T>,
): Promise<T> {
  console.log(`\n→ ${stageName} · ${agent.name}`);

  const response = await client.responses.parse({
    model: MODEL,
    reasoning: { effort: REASONING_EFFORT },
    input: [
      {
        role: "system",
        content: `${agent.instructions} Follow the goal of the current stage, preserve the input context exactly, and respond in English.`,
      },
      { role: "user", content: prompt },
    ],
    text: { format: zodTextFormat(schema, stageName) },
  });

  if (!response.output_parsed) {
    throw new Error(`Agent "${agent.id}" did not return structured output.`);
  }

  console.log(`✓ ${stageName} · ${agent.name}`);

  return response.output_parsed;
}

export async function runFallbackAgent(
  client: OpenAI,
  userMessage: string,
  expectedTopic: string,
): Promise<FallbackResponse> {
  return runStructuredAgent(
    client,
    agents.fallback,
    "unsupported_request",
    `The current question expects ${expectedTopic}.
Identify the actual topic of the user's answer and explain briefly why it does not answer this question.
Do not answer the unrelated request.

USER ANSWER:
${userMessage}`,
    fallbackResponseSchema,
  );
}
