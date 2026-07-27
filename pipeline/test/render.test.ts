import { describe, expect, test } from "bun:test";
import { demoPlan } from "../src/demo.ts";
import { renderHtml } from "../src/render.ts";

describe("renderHtml", () => {
  test("incluye las tres partes del resultado", () => {
    const html = renderHtml(demoPlan);

    expect(html).toContain("El menú");
    expect(html).toContain("Las recetas");
    expect(html).toContain("Lista de la compra");
  });

  test("escapa contenido generado por el modelo", () => {
    const unsafePlan = structuredClone(demoPlan);
    unsafePlan.menu.title = '<script>alert("xss")</script>';

    const html = renderHtml(unsafePlan);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
