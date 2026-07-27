# Pipeline LLM: menú semanal

Ejemplo didáctico de un pipeline lineal con Bun, TypeScript 7 y la Responses API
de OpenAI. Cada etapa tiene un prompt y un esquema Zod; su salida estructurada es
la entrada de la siguiente:

1. Crear el esqueleto de la semana.
2. Rellenar los platos.
3. Añadir las recetas.
4. Consolidar la lista de la compra por secciones.

Antes de las tres primeras etapas se solicita el contexto que solo esa etapa
necesita. El resultado se escribe en `output/menu-semanal.html` y se abre en el
navegador predeterminado.

Además de validar la forma con Zod, los contratos entre etapas comprueban que
una etapa no reescriba el trabajo anterior (por ejemplo, cambiar una fecha al
añadir las recetas).

## Preparación

```bash
bun install
cp .env.example .env
```

Edita `.env` y añade tu `OPENAI_API_KEY`. Bun carga ese archivo automáticamente.

## Uso

```bash
bun run start
```

Para probar el HTML sin clave ni llamadas a la API:

```bash
bun run demo
```

Comprobaciones:

```bash
bun run typecheck
bun test
```

El modelo predeterminado es `gpt-5.6-sol`; puede cambiarse con `OPENAI_MODEL`.
