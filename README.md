# Framework de automatización

Framework de pruebas de aceptación basado en **TypeScript**, **pnpm**, **Cucumber**, **Serenity/JS**, **Screenplay Pattern** y **Playwright**.

## Requisitos

- Node.js `^22.22.2` o `^24.15.0`
- pnpm `12.6.0`
- Google Chrome instalado localmente

## Comandos

```bash
pnpm install
pnpm test              # Escenarios Cucumber + Serenity/JS
pnpm test:playwright   # Regresión Playwright existente
pnpm test:all          # Ejecuta ambos runners
pnpm typecheck         # Comprobación TypeScript
pnpm test:report       # Abre el informe HTML de Serenity/JS
```

El runner Cucumber usa el canal `chrome`, por lo que no requiere descargar Chromium. El modo headless es el predeterminado; para abrir el Chrome local se puede ejecutar en PowerShell con:

```powershell
$env:HEADLESS = 'false'
pnpm test
```

La URL por defecto es `https://playwright.dev/`. Puede cambiarse con `BASE_URL` sin modificar el código.

## Estructura Screenplay

```text
features/
├── playwright-documentation.feature
├── step-definitions/
│   ├── parameter.steps.ts
│   └── playwright-documentation.steps.ts
└── support/
    └── serenity.config.ts
src/
└── screenplay/
    ├── abilities/
    ├── interactions/
    ├── questions/
    ├── tasks/
    └── ui/
```

Las step definitions solo conectan Gherkin con Screenplay. Los selectores están en `ui/`, las actividades de negocio en `tasks/`, las consultas de estado en `questions/` y las capacidades del actor en `abilities/`.

## Configuración existente

- `opencode.json` se mantiene sin cambios para conservar el servidor Playwright MCP con `--browser=chrome`.
- `playwright.config.ts` conserva el proyecto `chrome`, el canal local y sus opciones de reportería, workers y trazas.

## Pruebas Arajet

### Requisitos adicionales

- Google Chrome instalado localmente (canal `chrome`)
- Perfil persistente en `.arajet-browser-profile` (se crea automáticamente)

### Ejecución

```powershell
# Ejecutar escenarios Arajet (Cucumber + Serenity/JS)
pnpm test:cucumber

# Ejecutar con navegador visible (requerido para Cloudflare Turnstile)
$env:HEADLESS = 'false'
pnpm test:cucumber
```

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `ARAJET_BASE_URL` | URL base de Arajet | `https://www.arajet.com/es-us/home` |
| `HEADLESS` | Ejecutar sin ventana | `false` |
| `BROWSER_USER_DATA_DIR` | Directorio del perfil persistente | `.arajet-browser-profile` |

### Notas importantes

- Arajet protege el endpoint de guardado de pasajeros con Cloudflare Turnstile, que solo permite perfiles Chrome reales y persistentes.
- El modo headless está deshabilitado por defecto porque Cloudflare bloquea la ejecución sin ventana con un 403.
- El perfil persistente permite que la cookie de clearance de Cloudflare persista entre ejecuciones.
- Ver `docs/arajet-cloudflare.md` para más detalles.
