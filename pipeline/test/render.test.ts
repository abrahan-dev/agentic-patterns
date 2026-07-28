import { describe, expect, test } from "bun:test";
import { demoPlan } from "../src/demo/plan.ts";
import { renderHtml } from "../src/output/render-html.ts";

describe("renderHtml", () => {
  test("keeps the versioned demo HTML in sync with the demo plan", async () => {
    const demoHtml = await Bun.file(
      new URL("../output/weekly-menu.html", import.meta.url),
    ).text();

    expect(demoHtml).toBe(renderHtml(demoPlan));
  });

  test("includes all three result sections", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain("Meal plan");
    expect(html).toContain("Recipes");
    expect(html).toContain("Shopping list");
  });

  test("embeds the decorative food illustration without external assets", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain('<svg class="hero-art"');
    expect(html).toContain(
      'aria-label="A colorful bowl of vegetables with kitchen utensils"',
    );
    expect(html).not.toContain("<img");
  });

  test("escapes model-generated content", () => {
    const unsafePlan = structuredClone(demoPlan);
    unsafePlan.menu.title = '<script>alert("xss")</script>';

    const html = renderHtml(unsafePlan);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
