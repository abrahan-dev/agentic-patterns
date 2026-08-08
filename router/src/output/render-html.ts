import { renderHtml as renderPipelineHtml } from "../../../pipeline/src/output/render-html.ts";
import type { FinalPlan } from "../domain/schemas.ts";

// Use the same presentation in both examples. This makes the pattern comparison clear.
export function renderHtml(plan: FinalPlan): string {
  return renderPipelineHtml(plan);
}
