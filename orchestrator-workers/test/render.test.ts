import { expect, test } from "bun:test";
import { FakeAgentRunner } from "../src/demo/fake-agent-runner.ts";
import { demoRequest } from "../src/demo/request.ts";
import { createDayTasks } from "../src/domain/contracts.ts";
import { renderHtml } from "../src/output/render-html.ts";

test("HTML reuses the shared meal-plan presentation and escapes generated content", async () => {
  const runner = new FakeAgentRunner([0, 0, 0, 0, 0, 0, 0]);
  const planned = await runner.plan(demoRequest);
  planned.value.title = "Menu <unsafe>";
  const tasks = createDayTasks(demoRequest, planned.value);
  const contributions = await Promise.all(
    tasks.map(async (task) => (await runner.execute(task)).value),
  );
  const synthesis = await runner.synthesize(planned.value, contributions);
  const html = renderHtml({
    menu: planned.value,
    recipes: contributions.flatMap((contribution) => contribution.recipes),
    shoppingList: synthesis.value.shoppingList,
  });

  expect(html).toContain("Menu &lt;unsafe&gt;");
  expect(html).toContain("Meal-planning orchestrator–workers");
  expect(html).toContain("<h2>Meal plan</h2>");
  expect(html).toContain("<h2>Recipes</h2>");
  expect(html).toContain("<h2>Shopping list</h2>");
  expect(html).toContain("--tomato: #f85f4b");
  expect(html).not.toContain("Menu <unsafe>");
});
