import type { ChangePlan } from "../../domain/schemas.ts";

export const enterpriseWebAppTemplateVersion = 1 as const;

function packageJson(plan: ChangePlan): string {
  const dependencies: Record<string, string> = { zod: "4.4.3" };
  const developmentDependencies: Record<string, string> = {
    "@types/bun": "1.3.10",
    oxlint: "1.77.0",
    prettier: "3.8.2",
    typescript: "7.0.2",
  };
  const scripts: Record<string, string> = {
    "format:check": "prettier --check .",
    lint: "oxlint src test",
    typecheck: "tsc --noEmit",
    test: "bun test",
  };

  if (plan.backendRequired) {
    Object.assign(dependencies, {
      "@trpc/openapi": "11.18.0-alpha",
      "@trpc/server": "11.18.0",
    });
    scripts["dev:backend"] =
      `bun --watch src/apps/${plan.applicationName}/backend/server.ts`;
    scripts["openapi:generate"] = "trpc-openapi generate";
  }

  if (plan.dataRequired) {
    dependencies["drizzle-orm"] = "0.45.2";
    developmentDependencies["drizzle-kit"] = "0.31.8";
    scripts["db:generate"] = "drizzle-kit generate";
    scripts["db:migrate"] = "drizzle-kit migrate";
  }

  if (plan.frontendRequired) {
    Object.assign(dependencies, {
      "@tanstack/react-query": "5.101.4",
      "@tanstack/react-router": "1.170.23",
      "@trpc/client": "11.18.0",
      "@trpc/tanstack-react-query": "11.18.0",
      react: "19.2.8",
      "react-dom": "19.2.8",
      "react-hook-form": "7.62.0",
    });
    Object.assign(developmentDependencies, {
      "@playwright/test": "1.62.1",
      "@tailwindcss/vite": "4.3.3",
      "@testing-library/react": "16.3.0",
      "@types/react": "19.2.14",
      "@types/react-dom": "19.2.3",
      "@vitejs/plugin-react": "6.0.5",
      tailwindcss: "4.3.3",
      vite: "8.2.1",
    });
    scripts["dev:frontend"] = "vite";
    scripts["test:e2e"] = "playwright test";
  }

  return `${JSON.stringify(
    {
      name: plan.applicationName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts,
      dependencies,
      devDependencies: developmentDependencies,
    },
    null,
    2,
  )}\n`;
}

function backendFiles(applicationName: string): Record<string, string> {
  const root = `src/apps/${applicationName}/backend`;

  return {
    [`${root}/trpc.ts`]: `import { initTRPC } from "@trpc/server";\n\nexport const trpc = initTRPC.create();\n`,
    [`${root}/router.ts`]: `import { trpc } from "./trpc.ts";\n\nexport const appRouter = trpc.router({});\nexport type AppRouter = typeof appRouter;\n`,
    [`${root}/server.ts`]: `import { fetchRequestHandler } from "@trpc/server/adapters/fetch";\nimport { appRouter } from "./router.ts";\n\nconst port = Number(process.env.PORT ?? 3000);\n\nBun.serve({\n  port,\n  fetch(request) {\n    const url = new URL(request.url);\n\n    if (url.pathname === "/health") {\n      return Response.json({ status: "ok" });\n    }\n\n    return fetchRequestHandler({\n      endpoint: "/trpc",\n      req: request,\n      router: appRouter,\n      createContext: () => ({}),\n    });\n  },\n});\n`,
    [`test/apps/${applicationName}/backend/server.test.ts`]: `import { describe, expect, test } from "bun:test";\nimport { appRouter } from "../../../../src/apps/${applicationName}/backend/router.ts";\n\ndescribe("application router", () => {\n  test("starts with an explicit empty procedure map", () => {\n    expect(Object.keys(appRouter._def.procedures)).toEqual([]);\n  });\n});\n`,
  };
}

function frontendFiles(applicationName: string): Record<string, string> {
  const root = `src/apps/${applicationName}/frontend`;

  return {
    "index.html": `<div id="root"></div>\n<script type="module" src="/src/apps/${applicationName}/frontend/main.tsx"></script>\n`,
    [`${root}/app.tsx`]: `export function App() {\n  return (\n    <main>\n      <h1>${applicationName}</h1>\n    </main>\n  );\n}\n`,
    [`${root}/main.tsx`]: `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport { App } from "./app.tsx";\nimport "./styles.css";\n\nconst container = document.getElementById("root");\n\nif (!container) {\n  throw new Error("Missing #root element.");\n}\n\ncreateRoot(container).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n`,
    [`${root}/styles.css`]: `@import "tailwindcss";\n\n:root {\n  font-family: Inter, ui-sans-serif, system-ui, sans-serif;\n  color: #172033;\n  background: #f5f7fa;\n}\n`,
    [`${root}/env.d.ts`]: `declare module "*.css";\n`,
    [`test/apps/${applicationName}/frontend/app.test.tsx`]: `import { expect, test } from "bun:test";\nimport { App } from "../../../../src/apps/${applicationName}/frontend/app.tsx";\n\ntest("exports the application shell", () => {\n  expect(typeof App).toBe("function");\n});\n`,
    "playwright.config.ts": `import { defineConfig } from "@playwright/test";\n\nexport default defineConfig({\n  testDir: "./test/e2e",\n  use: { baseURL: "http://127.0.0.1:5173" },\n  webServer: {\n    command: "bun run dev:frontend",\n    port: 5173,\n    reuseExistingServer: true,\n  },\n});\n`,
    "test/e2e/.gitkeep": "",
    "vite.config.ts": `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\n\nexport default defineConfig({ plugins: [react(), tailwindcss()] });\n`,
  };
}

export function enterpriseWebAppTemplate(plan: ChangePlan): Record<string, string> {
  const files: Record<string, string> = {
    ".data/.gitkeep": "",
    ".gitignore":
      ".data/*\n!.data/.gitkeep\n.web-app-dev-team/\nnode_modules/\ndist/\ncoverage/\ntest-results/\nplaywright-report/\n",
    "package.json": packageJson(plan),
    "test/.gitkeep": "",
    "tsconfig.json": `{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "jsx": "react-jsx",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "Preserve",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext",
    "types": ["bun"]
  },
  "include": ["src", "test", "*.config.ts"]
}
`,
  };

  for (const context of plan.contexts) {
    for (const layer of ["application", "domain", "infrastructure"] as const) {
      files[`src/contexts/${context}/${layer}/.gitkeep`] = "";
    }
  }

  if (plan.backendRequired) {
    Object.assign(files, backendFiles(plan.applicationName));
  }

  if (plan.frontendRequired) {
    Object.assign(files, frontendFiles(plan.applicationName));
  }

  if (plan.dataRequired) {
    files["drizzle/.gitkeep"] = "";
    files["drizzle.config.ts"] =
      `import { defineConfig } from "drizzle-kit";\n\nexport default defineConfig({\n  dialect: "sqlite",\n  schema: "./src/contexts/*/infrastructure/persistence/schema.ts",\n  out: "./drizzle",\n  dbCredentials: { url: "./.data/${plan.applicationName}.sqlite" },\n});\n`;

    for (const context of plan.contexts) {
      files[`src/contexts/${context}/infrastructure/persistence/.gitkeep`] = "";
    }
  }

  return files;
}
