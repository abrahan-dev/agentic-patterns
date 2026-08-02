import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { MODEL, REASONING_EFFORT, ROUTER_CONFIDENCE_THRESHOLD } from "../config.ts";
import {
  agentIds,
  agents,
  routableAgents,
  type AgentDefinition,
  type AgentId,
  type SpecialistId,
} from "../agents/catalog.ts";

export const routerDecisionSchema = z.object({
  destination: z.enum(agentIds),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
});

export type RouterDecision = z.infer<typeof routerDecisionSchema>;

export interface RouteResult {
  agent: AgentDefinition;
  decision: RouterDecision;
  thresholdApplied: boolean;
  availabilityOverride: boolean;
}

function routerPrompt(input: string, candidates: AgentDefinition[]): string {
  const availableAgents = [...candidates, agents.fallback].map(
    ({ id, name, description }) => ({
      id,
      name,
      description,
    }),
  );

  return `Choose the single best agent for the raw end-user message below.
Use fallback when the request does not clearly match any listed specialist.
Choose only a destination ID shown in AVAILABLE SPECIALISTS.
Judge only the actual message. Do not infer a meal-planning intent from application context.
Payments, discounts, account issues, and other unrelated requests must use fallback.
Confidence expresses how certain you are that the chosen destination is correct.

AVAILABLE SPECIALISTS:
${JSON.stringify(availableAgents, null, 2)}

RAW END-USER MESSAGE:
${input}`;
}

export function applyConfidenceThreshold(
  decision: RouterDecision,
  threshold = ROUTER_CONFIDENCE_THRESHOLD,
): RouteResult {
  const belowThreshold = decision.confidence < threshold;
  const destination: AgentId = belowThreshold ? "fallback" : decision.destination;

  return {
    agent: agents[destination],
    decision,
    thresholdApplied: belowThreshold && decision.destination !== "fallback",
    availabilityOverride: false,
  };
}

export function applyRoutingPolicy(
  decision: RouterDecision,
  candidates: AgentDefinition[],
  threshold = ROUTER_CONFIDENCE_THRESHOLD,
): RouteResult {
  const confidenceRoute = applyConfidenceThreshold(decision, threshold);
  const unavailable =
    confidenceRoute.agent.id !== "fallback" &&
    !candidates.some((candidate) => candidate.id === confidenceRoute.agent.id);

  return unavailable
    ? {
        ...confidenceRoute,
        agent: agents.fallback,
        availabilityOverride: true,
      }
    : confidenceRoute;
}

export async function routeRequest(
  client: OpenAI,
  input: string,
  candidates: AgentDefinition[] = routableAgents,
): Promise<RouteResult> {
  console.log("\n→ router · analyzing request");
  console.log(`  candidates: ${candidates.map((agent) => agent.id).join(", ")}`);

  const response = await client.responses.parse({
    model: MODEL,
    reasoning: { effort: REASONING_EFFORT },
    input: [
      {
        role: "system",
        content:
          "You are a routing agent. Classify only the raw end-user message using the supplied agent descriptions. Unrelated messages must go to fallback, even when this router is embedded in a meal-planning application. Do not solve the request yourself.",
      },
      { role: "user", content: routerPrompt(input, candidates) },
    ],
    text: { format: zodTextFormat(routerDecisionSchema, "router_decision") },
  });

  if (!response.output_parsed) {
    throw new Error("Router did not return a structured decision.");
  }

  const route = applyRoutingPolicy(response.output_parsed, candidates);
  const percentage = Math.round(route.decision.confidence * 100);
  const modelChoice = route.decision.destination;
  const thresholdNote = route.thresholdApplied
    ? `; below ${Math.round(ROUTER_CONFIDENCE_THRESHOLD * 100)}% threshold, using fallback`
    : "";
  const availabilityNote = route.availabilityOverride
    ? "; destination is not available in this stage, using fallback"
    : "";

  console.log(
    `✓ router · ${modelChoice} (${percentage}% confidence${thresholdNote}${availabilityNote})`,
  );
  console.log(`  ${route.decision.reason}`);

  return route;
}

export function isSpecialist(agentId: AgentId): agentId is SpecialistId {
  return agentId !== "fallback";
}
