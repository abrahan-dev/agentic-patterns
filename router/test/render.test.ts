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
    expect(html).toContain("Nutrition specification");
  });

  test("uses the cook's menu summary in the hero", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain(demoPlan.menu.summary);
    expect(html).not.toContain(
      "A complete plan, from the first meal idea to the supermarket aisle.",
    );
  });

  test("renders non-empty nutrition fields and omits empty ones", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain("Dietary pattern");
    expect(html).toContain("Mediterranean");
    expect(html).toContain("balanced everyday nutrition");
    expect(html).not.toContain("<h3>Allergens</h3>");
    expect(html).not.toContain("<h3>Excluded ingredients</h3>");
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
    plan.menu.summary = "<script>summary</script>";
    plan.nutritionSpecification.summary = "<script>nutrition</script>";
    const html = renderHtml(plan);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
