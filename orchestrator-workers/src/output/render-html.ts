import { renderHtml as renderSharedHtml } from "../../../pipeline/src/output/render-html.ts";
import type { FinalPlan } from "../domain/schemas.ts";

// Every meal-planning pattern deliberately shares one visual presentation so
// the repository compares orchestration behavior rather than unrelated UIs.
export function renderHtml(plan: FinalPlan): string {
  return renderSharedHtml(plan, {
    patternLabel: "Meal-planning orchestrator–workers",
    footerText:
      "Generated with global planning, parallel recipe workers, and final synthesis.",
  });
}
