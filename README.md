# Framework de automatización

Framework de pruebas de aceptación basado en **TypeScript**, **pnpm**, **Cucumber**, **Serenity/JS**, **Screenplay Pattern** y **Playwright**.

## Requisitos

- Node.js `^22.22.2` o `^24.15.0`
- pnpm `12.6.0`
- Google Chrome instalado localmente

## Comandos

```bash
pnpm install
pnpm test              # Escenarios Cucumber + reporte Serenity BDD
pnpm typecheck         # Comprobación TypeScript
pnpm test:open         # Escenarios + reporte Serenity BDD y lo abre en el navegador
pnpm test:report       # Abre el último reporte Serenity BDD
pnpm test:parallel     # Escenarios en paralelo + reporte Serenity BDD
```

### Ejecución en paralelo

`pnpm test:parallel` reparte los escenarios en varios procesos de Cucumber (`--shard`), cada uno con su propio Chrome, y une los resultados en un único reporte Serenity BDD. El número de procesos se define con `PARALLEL` (por defecto 2):

```powershell
$env:PARALLEL = '3'
pnpm test:parallel
```

- Cada proceso usa un perfil `.arajet-browser-profile-shard-N`, copiado del perfil base la primera vez para conservar la verificación de Cloudflare. Para regenerarlos, borra esas carpetas.
- La salida de cada proceso lleva el prefijo `[shard N/M]`.
- Se pueden pasar opciones de Cucumber: `pnpm test:cucumber:parallel --tags @smoke`.
- Arajet puede limitar o desafiar muchas sesiones simultáneas desde la misma IP; conviene no subir mucho `PARALLEL`.

El runner Cucumber usa el canal `chrome`, por lo que no requiere descargar Chromium. El modo headless es el predeterminado; para abrir el Chrome local se puede ejecutar en PowerShell con:

```powershell
$env:HEADLESS = 'false'
pnpm test
```


## Reportes Serenity BDD

El reporte del proyecto es el de **Serenity BDD**.
Requiere **Java 17 o superior** en el `PATH` (por ejemplo `winget install --id Microsoft.OpenJDK.17 -e --source winget`).

```bash
pnpm test              # Pruebas UI (Arajet) + reporte en target/site/serenity/index.html
pnpm test:open         # Igual que pnpm test y además abre el reporte
pnpm test:report       # Abre el último reporte
pnpm report:bdd        # Solo regenera el reporte a partir de la última ejecución
pnpm report:bdd:setup  # Descarga/actualiza el CLI de Serenity BDD (se hace solo en pnpm install)
```

`test` y `test:open` generan el reporte aunque haya pruebas fallidas y terminan con el código de salida de las pruebas.

## Estructura Screenplay

Cada flujo de Arajet tiene su carpeta (`ibe/` para la reserva; `mmb/` para Manage My Booking). Lo que sirve a todos los flujos queda fuera de ellas.

```text
features/
├── ibe/                              # Reserva (Internet Booking Engine)
│   ├── arajet-flight-reservation.feature
│   └── step-definitions/
│       └── arajet-flight-reservation.steps.ts
└── support/
    ├── parameter-types.ts            # Común: {actor} y {pronoun}
    └── serenity.config.ts            # Común: navegador, Serenity, header secreto
src/
├── config/environment.ts             # Común: variables de entorno y .env
└── screenplay/
    ├── abilities/                    # Común
    ├── interactions/                 # Común: clics, esperas, autocompletado, "continuar hasta"
    ├── tasks/OpenArajet.ts           # Común
    ├── ui/locator.ts                 # Común
    └── ibe/
        ├── interactions/
        ├── questions/
        ├── tasks/
        ├── test-data/
        └── ui/
bookings/arajet-bookings.json         # Reservas creadas por IBE (número de confirmación y apellido)
```

Un flujo nuevo agrega sus archivos en su carpeta (`features/<flujo>/` y `src/screenplay/<flujo>/`) e importa lo común. Cucumber encuentra solo los `.feature` y `.steps.ts` de cualquier subcarpeta de `features/`.

Las step definitions solo conectan Gherkin con Screenplay. Los selectores están en `ui/`, las actividades de negocio en `tasks/`, las consultas de estado en `questions/` y las capacidades del actor en `abilities/`.

Para una explicación detallada del modelo y de cómo agregar rutas y casos, ver [docs/screenplay.md](docs/screenplay.md).

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
| `ARAJET_BASE_URL` | URL base de Arajet (UAT: `https://uat-www.arajet.com/es-do/home`) | `https://www.arajet.com/es-us/home` |
| `ARAJET_SECRET` | Valor de la cabecera de acceso a entornos de prueba (equivale a ModHeader). Solo se envía a dominios `arajet.com` | sin cabecera |
| `ARAJET_SECRET_HEADER` | Nombre de esa cabecera | `x-secret` |
| `HEADLESS` | Ejecutar sin ventana | `false` |
| `BROWSER_USER_DATA_DIR` | Directorio del perfil persistente | `.arajet-browser-profile` |
| `FAKER_SEED` | Semilla numérica para repetir los mismos datos de pasajeros (generados con Faker) | aleatoria |

### Notas importantes

- Arajet protege el endpoint de guardado de pasajeros con Cloudflare Turnstile, que solo permite perfiles Chrome reales y persistentes.
- El modo headless está deshabilitado por defecto porque Cloudflare bloquea la ejecución sin ventana con un 403.
- El perfil persistente permite que la cookie de clearance de Cloudflare persista entre ejecuciones.
- Ver `docs/arajet-cloudflare.md` para más detalles.
