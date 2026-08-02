import { renderHtml as renderPipelineHtml } from "../../../pipeline/src/output/render-html.ts";
import type { FinalPlan } from "../domain/schemas.ts";

// Both examples intentionally share their presentation so that the repository
// compares agentic patterns rather than unrelated UI implementations.
export function renderHtml(plan: FinalPlan): string {
  return renderPipelineHtml(plan);
}
