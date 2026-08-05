import type { TokenUsage } from "../agents/contracts.ts";

type AgentRole = "orchestrator" | "worker";

export interface TraceCall {
  label: string;
  role: AgentRole;
  model: string;
  effort: string;
  attempt?: number;
}

const emptyUsage = (): TokenUsage => ({
  inputTokens: 0,
  outputTokens: 0,
  reasoningTokens: 0,
  totalTokens: 0,
});

function addUsage(target: TokenUsage, usage: TokenUsage): void {
  target.inputTokens += usage.inputTokens;
  target.outputTokens += usage.outputTokens;
  target.reasoningTokens += usage.reasoningTokens;
  target.totalTokens += usage.totalTokens;
}

export class RunTracer {
  private readonly startedAt: number;
  private readonly totals = {
    orchestrator: emptyUsage(),
    worker: emptyUsage(),
  };
  private readonly calls = { orchestrator: 0, worker: 0 };
  private activeWorkers = 0;
  private peakWorkers = 0;

  constructor(
    private readonly sink: (message: string) => void = console.log,
    private readonly now: () => number = performance.now.bind(performance),
  ) {
    this.startedAt = now();
  }

  private timestamp(): string {
    const elapsed = this.now() - this.startedAt;

    return `[+${(elapsed / 1000).toFixed(3)}s]`;
  }

  async call<T extends { usage: TokenUsage }>(
    details: TraceCall,
    operation: () => Promise<T>,
  ): Promise<T> {
    const startedAt = this.now();
    const attempt = details.attempt ? ` attempt=${details.attempt}` : "";
    const symbol = details.role === "worker" ? "↗" : "→";

    this.calls[details.role] += 1;

    if (details.role === "worker") {
      this.activeWorkers += 1;
      this.peakWorkers = Math.max(this.peakWorkers, this.activeWorkers);
    }

    this.sink(
      `${this.timestamp()} ${symbol} ${details.label} started model=${details.model} effort=${details.effort}${attempt}`,
    );

    try {
      const result = await operation();
      const duration = (this.now() - startedAt) / 1000;
      addUsage(this.totals[details.role], result.usage);
      this.sink(
        `${this.timestamp()} ✓ ${details.label} completed duration=${duration.toFixed(2)}s reasoning_tokens=${result.usage.reasoningTokens}`,
      );

      return result;
    } catch (error) {
      const duration = (this.now() - startedAt) / 1000;
      const message = error instanceof Error ? error.message : String(error);
      this.sink(
        `${this.timestamp()} ✗ ${details.label} failed duration=${duration.toFixed(2)}s error=${message}`,
      );

      throw error;
    } finally {
      if (details.role === "worker") {
        this.activeWorkers -= 1;
      }
    }
  }

  summary(): void {
    const combined = emptyUsage();
    addUsage(combined, this.totals.orchestrator);
    addUsage(combined, this.totals.worker);

    this.sink("\nRun summary");
    this.sink(`  orchestrator calls: ${this.calls.orchestrator}`);
    this.sink(`  worker calls:       ${this.calls.worker}`);
    this.sink(`  peak concurrency:   ${this.peakWorkers}`);
    this.sink(
      `  elapsed:            ${((this.now() - this.startedAt) / 1000).toFixed(2)}s`,
    );
    this.sink(`  input tokens:       ${combined.inputTokens}`);
    this.sink(`  output tokens:      ${combined.outputTokens}`);
    this.sink(`  reasoning tokens:   ${combined.reasoningTokens}`);
    this.sink(`  total tokens:       ${combined.totalTokens}`);
  }
}
