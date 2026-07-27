import type { FinalPlan } from "./schemas.ts";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );

export function renderHtml(plan: FinalPlan): string {
  const menuDays = plan.menu.days
    .map(
      (day) => `
        <article class="day">
          <p class="eyebrow">${escapeHtml(day.date)}</p>
          <h3>${escapeHtml(day.dayName)}</h3>
          ${day.meals
            .map(
              (meal) => `
                <div class="meal">
                  <span>${escapeHtml(meal.type)}</span>
                  <strong>${escapeHtml(meal.dish)}</strong>
                  <p>${escapeHtml(meal.description)}</p>
                </div>`,
            )
            .join("")}
        </article>`,
    )
    .join("");

  const recipes = plan.recipes
    .map(
      (recipe, index) => `
        <details class="recipe"${index === 0 ? " open" : ""}>
          <summary>
            <span>${escapeHtml(recipe.date)} · ${escapeHtml(recipe.mealType)}</span>
            ${escapeHtml(recipe.dish)}
          </summary>
          <div class="recipe-body">
            <div>
              <h4>Ingredientes</h4>
              <ul>${recipe.ingredients
                .map(
                  (item) =>
                    `<li>${escapeHtml(item.quantity)} · ${escapeHtml(item.name)}</li>`,
                )
                .join("")}</ul>
            </div>
            <div>
              <h4>Preparación</h4>
              <ol>${recipe.steps
                .map((step) => `<li>${escapeHtml(step)}</li>`)
                .join("")}</ol>
            </div>
          </div>
        </details>`,
    )
    .join("");

  const shoppingList = plan.shoppingList
    .map(
      (section) => `
        <section class="shopping-section">
          <h3>${escapeHtml(section.section)}</h3>
          <ul>${section.items
            .map(
              (item) =>
                `<li><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.quantity)}</strong></li>`,
            )
            .join("")}</ul>
        </section>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(plan.menu.title)}</title>
  <style>
    :root { color-scheme: light; --ink:#19332d; --muted:#687973; --paper:#f7f3e8; --card:#fffdf7; --accent:#e9693f; --green:#275b4d; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font:16px/1.55 ui-sans-serif,system-ui,sans-serif; }
    header { padding:72px max(24px,7vw) 56px; color:white; background:var(--green); }
    header p { max-width:650px; color:#dce9e3; }
    h1 { max-width:900px; margin:0; font:clamp(2.7rem,7vw,6.5rem)/.94 Georgia,serif; letter-spacing:-.05em; }
    main { width:min(1420px,90vw); margin:auto; padding:64px 0 96px; }
    h2 { margin:0 0 24px; font:clamp(2rem,4vw,3.4rem)/1 Georgia,serif; }
    .section { margin-bottom:80px; }
    .days { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; }
    .day,.recipe,.shopping-section { background:var(--card); border:1px solid #ded8c8; border-radius:18px; box-shadow:0 8px 30px #18352d0a; }
    .day { padding:24px; }
    .day h3 { margin:0 0 20px; font:1.8rem Georgia,serif; text-transform:capitalize; }
    .eyebrow,.meal span,summary span { color:var(--accent); font-size:.75rem; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
    .meal { padding:14px 0; border-top:1px solid #e9e3d6; }
    .meal span,.meal strong { display:block; }
    .meal p { margin:4px 0 0; color:var(--muted); font-size:.92rem; }
    .recipes { display:grid; gap:12px; }
    .recipe { padding:0 22px; }
    summary { padding:20px 0; cursor:pointer; font-weight:750; }
    summary span { display:block; margin-bottom:3px; }
    .recipe-body { display:grid; grid-template-columns:minmax(180px,1fr) 2fr; gap:36px; padding:4px 0 24px; border-top:1px solid #e9e3d6; }
    .recipe-body h4 { margin-bottom:8px; }
    .recipe-body li { margin-bottom:7px; }
    .shopping { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
    .shopping-section { padding:22px; }
    .shopping-section h3 { margin-top:0; font:1.45rem Georgia,serif; }
    .shopping-section ul { list-style:none; padding:0; margin:0; }
    .shopping-section li { display:flex; justify-content:space-between; gap:16px; padding:9px 0; border-top:1px solid #e9e3d6; }
    .shopping-section strong { color:var(--muted); white-space:nowrap; }
    footer { padding:30px; text-align:center; color:var(--muted); }
    @media (max-width:650px) { header { padding-top:48px; } .recipe-body { grid-template-columns:1fr; gap:8px; } }
  </style>
</head>
<body>
  <header>
    <p class="eyebrow">Pipeline de planificación</p>
    <h1>${escapeHtml(plan.menu.title)}</h1>
    <p>Semana del ${escapeHtml(plan.menu.startsOn)} · Un plan completo, desde el menú hasta el pasillo del hipermercado.</p>
  </header>
  <main>
    <section class="section"><h2>El menú</h2><div class="days">${menuDays}</div></section>
    <section class="section"><h2>Las recetas</h2><div class="recipes">${recipes}</div></section>
    <section class="section"><h2>Lista de la compra</h2><div class="shopping">${shoppingList}</div></section>
  </main>
  <footer>Generado mediante un pipeline lineal de cuatro etapas con OpenAI.</footer>
</body>
</html>`;
}
