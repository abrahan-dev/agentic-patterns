import { describe, expect, test } from "bun:test";
import { demoPlan } from "../src/demo.ts";
import { renderHtml } from "../src/render.ts";

describe("renderHtml", () => {
  test("includes all three result sections", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain("Meal plan");
    expect(html).toContain("Recipes");
    expect(html).toContain("Shopping list");
  });

  test("escapes model-generated content", () => {
    const unsafePlan = structuredClone(demoPlan);
    unsafePlan.menu.title = '<script>alert("xss")</script>';

    const html = renderHtml(unsafePlan);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
