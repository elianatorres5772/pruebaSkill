---
name: serenity-screenplay-e2e
description: Orquesta el ciclo completo de automatización E2E con Serenity/JS, Screenplay, Cucumber y Playwright MCP.
---

# E2E Automation Workflow

Cuando se solicite automatizar un flujo completo:

1. Analiza el requerimiento y el proyecto existente.

2. Si el framework Serenity/JS + Cucumber + Screenplay
   todavía no está configurado:
   carga y aplica la skill:
   `serenity-screenplay-scaffold`

3. Carga y aplica:
   `serenity-screenplay-feature`

   Usa Playwright MCP cuando necesites explorar la aplicación.

4. Ejecuta la automatización creada.

5. Carga y aplica:
   `serenity-screenplay-review`

6. Corrige los hallazgos de arquitectura que correspondan.

7. Ejecuta nuevamente el escenario y la regresión relacionada.

Usa pnpm exclusivamente.

No reconstruyas el framework si ya existe.