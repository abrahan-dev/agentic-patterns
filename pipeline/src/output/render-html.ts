import type { FinalPlan } from "../domain/schemas.ts";

interface NutritionPresentation {
  summary: string;
  dietaryPattern: string;
  goals: string[];
  allergens: string[];
  excludedIngredients: string[];
  recommendations: string[];
}

type EnhancedFinalPlan = FinalPlan & {
  menu: FinalPlan["menu"] & { summary?: string };
  nutritionSpecification?: NutritionPresentation;
};

export interface RenderPresentation {
  patternLabel?: string;
  footerText?: string;
}

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

export function renderHtml(
  plan: FinalPlan,
  presentation: RenderPresentation = {},
): string {
  const enhancedPlan = plan as EnhancedFinalPlan;
  const nutrition = enhancedPlan.nutritionSpecification;
  const menuSummary =
    enhancedPlan.menu.summary?.trim() ||
    "A complete plan, from the first meal idea to the supermarket aisle.";
  const patternLabel =
    presentation.patternLabel ??
    (nutrition ? "Meal-planning router" : "Meal-planning pipeline");
  const footerText =
    presentation.footerText ??
    (nutrition
      ? "Generated with nutrition and cuisine routers using specialized OpenAI agents."
      : "Generated with a four-stage linear OpenAI pipeline.");
  const menuDays = plan.menu.days
    .map(
      (day) => `
        <article class="day">
          <p class="eyebrow">${escapeHtml(day.date)}</p>
          <h3>${escapeHtml(day.dayName)}</h3>${day.meals
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
              <h4>Ingredients</h4>
              <ul>${recipe.ingredients
                .map(
                  (item) =>
                    `<li>${escapeHtml(item.quantity)} · ${escapeHtml(item.name)}</li>`,
                )
                .join("")}</ul>
            </div>
            <div>
              <h4>Method</h4>
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

  const nutritionSection = nutrition
    ? (() => {
        const fields = [
          { label: "Dietary pattern", values: [nutrition.dietaryPattern] },
          { label: "Goals", values: nutrition.goals },
          { label: "Allergens", values: nutrition.allergens },
          { label: "Excluded ingredients", values: nutrition.excludedIngredients },
          { label: "Recommendations", values: nutrition.recommendations },
        ].filter((field) => field.values.some((value) => value.trim()));

        return `
    <section class="section">
      <div class="section-heading"><span class="section-number">4</span><h2>Nutrition specification</h2></div>
      <article class="nutrition-report">
        <p class="nutrition-summary">${escapeHtml(nutrition.summary)}</p>
        <div class="nutrition-grid">${fields
          .map(
            (field) => `
          <section class="nutrition-card">
            <h3>${escapeHtml(field.label)}</h3>
            <ul>${field.values
              .filter((value) => value.trim())
              .map((value) => `<li>${escapeHtml(value)}</li>`)
              .join("")}</ul>
          </section>`,
          )
          .join("")}</div>
      </article>
    </section>`;
      })()
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(plan.menu.title)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #263238;
      --muted: #65706f;
      --cream: #fffaf0;
      --paper: #fff3d6;
      --card: #ffffff;
      --tomato: #f85f4b;
      --sun: #ffc93c;
      --leaf: #4fae73;
      --aqua: #49bfc6;
      --plum: #76528b;
      --line: #eadfc9;
      --shadow: 0 18px 45px rgba(84, 63, 35, 0.1);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(circle at 8% 18%, rgba(255, 201, 60, 0.22) 0 90px, transparent 91px),
        radial-gradient(circle at 96% 52%, rgba(73, 191, 198, 0.15) 0 120px, transparent 121px),
        var(--cream);
      font: 16px/1.6 ui-rounded, "Avenir Next", "Segoe UI", system-ui, sans-serif;
    }

    header {
      position: relative;
      overflow: hidden;
      padding: 52px max(24px, 6vw);
      background: linear-gradient(125deg, #ffe477 0%, #ffc85c 52%, #ff9b6b 100%);
      border-bottom: 5px solid var(--ink);
    }

    header::before,
    header::after {
      position: absolute;
      width: 220px;
      height: 220px;
      border: 3px solid rgba(255, 255, 255, 0.42);
      border-radius: 50%;
      content: "";
    }

    header::before {
      top: -120px;
      left: 42%;
    }

    header::after {
      right: -80px;
      bottom: -150px;
    }

    .hero {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: clamp(24px, 6vw, 88px);
      align-items: center;
      width: min(1320px, 100%);
      margin: auto;
    }

    .hero-copy {
      max-width: 760px;
    }

    .hero .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 20px;
      padding: 8px 14px;
      color: var(--ink);
      background: rgba(255, 255, 255, 0.65);
      border: 2px solid var(--ink);
      border-radius: 999px;
      box-shadow: 3px 3px 0 var(--ink);
    }

    .hero .eyebrow::before {
      width: 9px;
      height: 9px;
      background: var(--tomato);
      border-radius: 50%;
      content: "";
    }

    h1 {
      max-width: 850px;
      margin: 0;
      font-size: clamp(3rem, 7vw, 6.7rem);
      font-weight: 900;
      line-height: 0.94;
      letter-spacing: -0.065em;
    }

    .hero-copy > p:last-child {
      max-width: 620px;
      margin: 28px 0 0;
      font-size: clamp(1.05rem, 2vw, 1.35rem);
      font-weight: 650;
    }

    .hero-art {
      width: min(100%, 520px);
      margin: auto;
      filter: drop-shadow(0 22px 22px rgba(86, 51, 27, 0.18));
      transform: rotate(2deg);
    }

    main {
      width: min(1380px, 90vw);
      margin: auto;
      padding: 76px 0 110px;
    }

    .section {
      margin-bottom: 92px;
    }

    .section-heading {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 28px;
    }

    .section-number {
      display: grid;
      flex: 0 0 46px;
      width: 46px;
      height: 46px;
      color: white;
      background: var(--tomato);
      border: 2px solid var(--ink);
      border-radius: 15px;
      box-shadow: 4px 4px 0 var(--ink);
      font-weight: 900;
      place-items: center;
      transform: rotate(-4deg);
    }

    h2 {
      margin: 0;
      font-size: clamp(2.2rem, 4vw, 3.8rem);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.045em;
    }

    .days {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 18px;
    }

    .day,
    .recipe,
    .shopping-section {
      background: var(--card);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow);
    }

    .day {
      position: relative;
      overflow: hidden;
      padding: 26px;
      border-radius: 24px;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease;
    }

    .day::after {
      position: absolute;
      top: -22px;
      right: -22px;
      width: 72px;
      height: 72px;
      background: var(--sun);
      border: 2px solid var(--ink);
      border-radius: 50%;
      content: "";
    }

    .day:nth-child(3n + 2)::after {
      background: #9edcbd;
    }

    .day:nth-child(3n + 3)::after {
      background: #9ddde0;
    }

    .day:hover {
      z-index: 2;
      box-shadow: 8px 10px 0 var(--ink);
      transform: translate(-3px, -4px) rotate(-0.5deg);
    }

    .day h3 {
      margin: 2px 0 22px;
      font-size: 1.7rem;
      line-height: 1.05;
      text-transform: capitalize;
    }

    .eyebrow,
    .meal span,
    summary span {
      color: var(--tomato);
      font-size: 0.74rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .meal {
      padding: 15px 0;
      border-top: 1px dashed #d8c9ad;
    }

    .meal span,
    .meal strong {
      display: block;
    }

    .meal strong {
      margin-top: 3px;
      font-size: 1.03rem;
    }

    .meal p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 0.92rem;
    }

    .recipes {
      display: grid;
      gap: 14px;
    }

    .recipe {
      padding: 0 24px;
      border-radius: 20px;
    }

    .recipe:nth-child(4n + 1) {
      border-left: 9px solid var(--tomato);
    }

    .recipe:nth-child(4n + 2) {
      border-left: 9px solid var(--leaf);
    }

    .recipe:nth-child(4n + 3) {
      border-left: 9px solid var(--aqua);
    }

    .recipe:nth-child(4n + 4) {
      border-left: 9px solid var(--sun);
    }

    summary {
      position: relative;
      padding: 22px 44px 22px 0;
      cursor: pointer;
      font-size: 1.08rem;
      font-weight: 850;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }

    summary::after {
      position: absolute;
      top: 50%;
      right: 0;
      display: grid;
      width: 32px;
      height: 32px;
      background: var(--paper);
      border: 2px solid var(--ink);
      border-radius: 50%;
      content: "+";
      font-size: 1.35rem;
      place-items: center;
      transform: translateY(-50%);
    }

    details[open] summary::after {
      content: "–";
    }

    summary span {
      display: block;
      margin-bottom: 3px;
    }

    .recipe-body {
      display: grid;
      grid-template-columns: minmax(190px, 1fr) 2fr;
      gap: 40px;
      padding: 20px 0 28px;
      border-top: 2px dashed var(--line);
    }

    .recipe-body h4 {
      margin: 0 0 10px;
      color: var(--plum);
      font-size: 1rem;
      text-transform: uppercase;
    }

    .recipe-body ul,
    .recipe-body ol {
      padding-left: 22px;
    }

    .recipe-body li {
      margin-bottom: 8px;
    }

    .shopping {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
      gap: 18px;
    }

    .shopping-section {
      padding: 25px;
      background: #fff8dd;
      border-radius: 24px;
    }

    .shopping-section:nth-child(3n + 2) {
      background: #e7f7eb;
    }

    .shopping-section:nth-child(3n + 3) {
      background: #e6f7f8;
    }

    .shopping-section h3 {
      margin: 0 0 14px;
      font-size: 1.4rem;
      line-height: 1.1;
    }

    .shopping-section ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .shopping-section li {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
      gap: 16px;
      align-items: start;
      padding: 10px 0;
      border-top: 1px dashed rgba(38, 50, 56, 0.28);
    }

    .shopping-section li > span,
    .shopping-section li > strong {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .shopping-section strong {
      color: var(--plum);
      text-align: right;
    }

    .nutrition-report {
      padding: clamp(24px, 4vw, 42px);
      background: linear-gradient(135deg, #fff8dd, #e7f7eb);
      border: 2px solid var(--ink);
      border-radius: 28px;
      box-shadow: var(--shadow);
    }

    .nutrition-summary {
      max-width: 850px;
      margin: 0 0 28px;
      font-size: clamp(1.15rem, 2vw, 1.45rem);
      font-weight: 750;
    }

    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .nutrition-card {
      padding: 20px;
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid var(--ink);
      border-radius: 20px;
    }

    .nutrition-card h3 {
      margin: 0 0 10px;
      color: var(--plum);
      font-size: 1rem;
      text-transform: uppercase;
    }

    .nutrition-card ul {
      margin: 0;
      padding-left: 20px;
    }

    .nutrition-card li + li {
      margin-top: 7px;
    }

    footer {
      padding: 34px;
      color: white;
      background: var(--ink);
      text-align: center;
    }

    @media (max-width: 850px) {
      .hero {
        grid-template-columns: 1fr;
      }

      .hero-copy {
        text-align: center;
      }

      .hero .eyebrow {
        justify-content: center;
      }

      .hero-copy > p:last-child {
        margin-right: auto;
        margin-left: auto;
      }

      .hero-art {
        width: min(78vw, 430px);
      }
    }

    @media (max-width: 650px) {
      header {
        padding-top: 40px;
      }

      main {
        width: min(92vw, 1380px);
        padding-top: 56px;
      }

      .section {
        margin-bottom: 68px;
      }

      .recipe-body {
        grid-template-columns: 1fr;
        gap: 10px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .day {
        transition: none;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${patternLabel}</p>
        <h1>${escapeHtml(plan.menu.title)}</h1>
        <p>Week of ${escapeHtml(plan.menu.startsOn)} · ${escapeHtml(menuSummary)}</p>
      </div>
      <svg class="hero-art" viewBox="0 0 520 390" role="img" aria-label="A colorful bowl of vegetables with kitchen utensils">
        <path d="M80 86C123 22 211 7 283 32c62 21 102 3 154 35 63 38 68 139 17 200-44 52-73 99-155 107-93 9-204-20-237-96-28-64-21-134 18-192Z" fill="#fff8dd" stroke="#263238" stroke-width="5"/>
        <g fill="none" stroke="#263238" stroke-linecap="round" stroke-linejoin="round" stroke-width="8">
          <path d="M92 121v160"/>
          <path d="M72 119v60c0 25 40 25 40 0v-60"/>
          <path d="M92 120v58"/>
          <path d="M429 108c-27 17-25 64 1 75v105"/>
          <ellipse cx="430" cy="142" rx="28" ry="42" fill="#f7b563"/>
        </g>
        <ellipse cx="265" cy="306" rx="140" ry="31" fill="#f1c8a6" stroke="#263238" stroke-width="5"/>
        <path d="M140 190h250c-8 86-57 137-125 137s-117-51-125-137Z" fill="#f85f4b" stroke="#263238" stroke-linejoin="round" stroke-width="6"/>
        <path d="M149 191c23 23 55 31 88 19 28-10 50-8 76 3 30 13 51 6 68-22" fill="none" stroke="#c43f35" stroke-linecap="round" stroke-width="5"/>
        <g stroke="#263238" stroke-width="5">
          <path d="M181 187c-22-43 24-76 57-43 3-50 67-51 72-5 29-29 77 1 55 48Z" fill="#5bc47d" stroke-linejoin="round"/>
          <circle cx="223" cy="169" r="31" fill="#ffc93c"/>
          <circle cx="328" cy="167" r="32" fill="#f85f4b"/>
          <path d="m328 132 7 17 18-5-13 14 13 14-19-5-6 18-6-18-19 5 13-14-13-14 18 5Z" fill="#4fae73" stroke-linejoin="round"/>
          <path d="m254 181 49-78 31 20-63 67Z" fill="#ff9848" stroke-linejoin="round"/>
          <path d="m305 112 20-30 4 34 27-17-17 29" fill="#4fae73" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M188 160c-18-44 25-69 49-30" fill="#49bfc6" stroke-linecap="round"/>
        </g>
        <g fill="#76528b" stroke="#263238" stroke-width="4">
          <path d="m122 60 5 14 14 5-14 5-5 14-5-14-14-5 14-5Z"/>
          <path d="m413 64 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z"/>
          <circle cx="445" cy="238" r="8"/>
          <circle cx="70" cy="243" r="7" fill="#49bfc6"/>
        </g>
      </svg>
    </div>
  </header>
  <main>
    <section class="section">
      <div class="section-heading"><span class="section-number">1</span><h2>Meal plan</h2></div>
      <div class="days">${menuDays}</div>
    </section>
    <section class="section">
      <div class="section-heading"><span class="section-number">2</span><h2>Recipes</h2></div>
      <div class="recipes">${recipes}</div>
    </section>
    <section class="section">
      <div class="section-heading"><span class="section-number">3</span><h2>Shopping list</h2></div>
      <div class="shopping">${shoppingList}</div>
    </section>${nutritionSection}
  </main>
  <footer>${footerText}</footer>
</body>
</html>`;
}
