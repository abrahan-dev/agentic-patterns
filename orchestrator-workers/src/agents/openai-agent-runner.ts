import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ResponseUsage } from "openai/resources/responses/responses";
import type { ZodType } from "zod";
import type { AppConfig } from "../config.ts";
import {
  dayContributionSchema,
  plannedMenuSchema,
  shoppingSynthesisSchema,
  type DayContribution,
  type DayTask,
  type MealPlanRequest,
  type PlannedMenu,
  type ShoppingSynthesis,
} from "../domain/schemas.ts";
import type { AgentResult, AgentRunner, TokenUsage } from "./contracts.ts";
import { plannerPrompt, synthesisPrompt, workerPrompt } from "./prompts.ts";

function tokenUsage(usage: ResponseUsage | undefined): TokenUsage {
  return {
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    reasoningTokens: usage?.output_tokens_details.reasoning_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
  };
}

export class OpenAIAgentRunner implements AgentRunner {
  readonly models;

  constructor(
    private readonly client: OpenAI,
    private readonly config: AppConfig,
  ) {
    this.models = {
      orchestrator: config.orchestratorModel,
      worker: config.workerModel,
    };
  }

  private async runStructured<T>(
    model: string,
    effort: AppConfig["orchestratorReasoningEffort"],
    name: string,
    instructions: string,
    prompt: string,
    schema: ZodType<T>,
  ): Promise<AgentResult<T>> {
    const response = await this.client.responses.parse({
      model,
      reasoning: { effort },
      input: [
        { role: "system", content: instructions },
        { role: "user", content: prompt },
      ],
      text: { format: zodTextFormat(schema, name) },
    });

    if (!response.output_parsed) {
      throw new Error(`${name} did not return structured output.`);
    }

    return {
      value: response.output_parsed,
      usage: tokenUsage(response.usage),
    };
  }

  plan(request: MealPlanRequest): Promise<AgentResult<PlannedMenu>> {
    return this.runStructured(
      this.config.orchestratorModel,
      this.config.orchestratorReasoningEffort,
      "weekly_menu_plan",
      "You are the orchestrator for a meal-planning system. Make globally coherent decisions for the full week. Respond in English.",
      plannerPrompt(request),
      plannedMenuSchema,
    );
  }

  execute(task: DayTask): Promise<AgentResult<DayContribution>> {
    return this.runStructured(
      this.config.workerModel,
      this.config.workerReasoningEffort,
      "daily_recipes",
      "You are a recipe worker. Execute only the supplied daily task and preserve every assigned dish exactly. Respond in English.",
      workerPrompt(task),
      dayContributionSchema,
    );
  }

  synthesize(
    menu: PlannedMenu,
    contributions: DayContribution[],
  ): Promise<AgentResult<ShoppingSynthesis>> {
    return this.runStructured(
      this.config.orchestratorModel,
      this.config.orchestratorReasoningEffort,
      "shopping_synthesis",
      "You are the orchestrator returning after parallel workers completed. Synthesize their ingredients without changing their work. Respond in English.",
      synthesisPrompt(menu, contributions),
      shoppingSynthesisSchema,
    );
  }
}
