import { renderHtml as renderSharedHtml } from "../../../pipeline/src/output/render-html.ts";
import type { FinalPlan } from "../domain/schemas.ts";

// Use one visual design for all meal-plan patterns. This makes the orchestration comparison clear.
export function renderHtml(plan: FinalPlan): string {
  return renderSharedHtml(plan, {
    patternLabel: "Meal-planning orchestrator–workers",
    footerText:
      "Generated with global planning, parallel recipe workers, and final synthesis.",
  });
}
