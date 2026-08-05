import type {
  DayContribution,
  DayTask,
  MealPlanRequest,
  PlannedMenu,
  ShoppingSynthesis,
} from "../domain/schemas.ts";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface AgentResult<T> {
  value: T;
  usage: TokenUsage;
}

export interface AgentModels {
  orchestrator: string;
  worker: string;
}

export interface AgentRunner {
  readonly models: AgentModels;
  plan(request: MealPlanRequest): Promise<AgentResult<PlannedMenu>>;
  execute(task: DayTask): Promise<AgentResult<DayContribution>>;
  synthesize(
    menu: PlannedMenu,
    contributions: DayContribution[],
  ): Promise<AgentResult<ShoppingSynthesis>>;
}
