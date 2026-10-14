# Arajet + Cloudflare Turnstile (por qué la suite corre headed y persistente)

## Resumen

El flujo E2E de Arajet (búsqueda → vuelos → pasajero → selección de asientos) funciona
de extremo a extremo, **pero** el paso que guarda al pasajero está protegido por
**Cloudflare Turnstile** (antibot). Esto condiciona cómo debe ejecutarse la suite.

## El problema

Al pulsar «Continuar» en el paso de pasajero, la app envía:

```
PUT https://www.arajet.com/pss/shop/travelers/<id>
```

En un navegador automatizado **sin clearance de Cloudflare**, esa petición responde
**403 Forbidden** y la app **no avanza** al paso de asientos (se queda en `step=3`).
Los logs del navegador muestran además `Turnstile challenge error (600010)`.

Esto no es un problema de selectores ni de temporización: es una protección de
servidor. Se comprobó que ocurre en headless **y** en headful con contextos no
persistentes.

## La solución adoptada

La suite de Serenity/JS usa un **contexto persistente de Chrome real y headed**
(`features/support/serenity.config.ts`):

- `chromium.launchPersistentContext(...)` con `channel: 'chrome'` y un directorio de
  perfil (`.arajet-browser-profile/`), para que la cookie de clearance de Cloudflare
  se resuelva una vez y persista entre ejecuciones.
- `headless: false` por defecto. Un perfil persistente de Chrome real resuelve el
  desafío de Turnstile automáticamente, y entonces el `PUT .../travelers/...` responde
  200 y el flujo continúa al mapa de sillas.

Con esta configuración el escenario `Search and select seats for a round trip` pasa
completo, incluyendo la selección de asientos para ambos vuelos.

## Cómo ejecutarlo

```bash
pnpm test:cucumber          # headed + persistente (flujo Arajet completo) ✅
```

Variables de entorno relevantes (ver `src/config/environment.ts`):

| Variable                | Por defecto | Descripción |
|-------------------------|-------------|-------------|
| `HEADLESS`              | `false`     | `true` = sin ventana. **El paso de pasajero→asientos fallará con 403 de Cloudflare.** |
| `BROWSER_USER_DATA_DIR` | `.arajet-browser-profile` | Directorio del perfil persistente. |
| `ARAJET_BASE_URL`       | `https://www.arajet.com/es-us/home` | URL base. |

## Limitaciones conocidas

- **Headless no completa el flujo Arajet.** Con `HEADLESS=true` la búsqueda y la
  selección de vuelos funcionan, pero el guardado del pasajero devuelve 403 y el test
  se detiene antes del mapa de sillas. En CI sin display, hace falta un perfil con
  clearance previa (p. ej. ejecutar una vez headed y reutilizar el directorio de perfil,
  o resolver el desafío manualmente).
- **Datos de Cloudflare/IP.** La clearance está ligada al navegador y a la IP. Cambiar
  de IP o de perfil puede requerir volver a resolver el desafío.
- Para reiniciar la clearance, borra el directorio `.arajet-browser-profile/`.
