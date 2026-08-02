import { describe, expect, test } from "bun:test";
import { demoPlan } from "../src/demo/plan.ts";
import { renderHtml } from "../src/output/render-html.ts";

describe("renderHtml", () => {
  test("keeps the versioned demo HTML in sync", async () => {
    const demoHtml = await Bun.file(
      new URL("../output/weekly-menu.html", import.meta.url),
    ).text();

    expect(demoHtml).toBe(renderHtml(demoPlan));
  });

  test("includes every result section", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain("Meal plan");
    expect(html).toContain("Recipes");
    expect(html).toContain("Shopping list");
  });

  test("uses the same visual presentation as the pipeline pattern", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain('<svg class="hero-art"');
    expect(html).toContain("A colorful bowl of vegetables with kitchen utensils");
    expect(html).toContain('class="section-number"');
    expect(html).toContain("--tomato: #f85f4b");
  });

  test("escapes model-generated content", () => {
    const plan = structuredClone(demoPlan);
    plan.menu.title = "<script>alert('xss')</script>";
    const html = renderHtml(plan);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
