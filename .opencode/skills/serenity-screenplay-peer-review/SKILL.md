---
name: serenity-screenplay-peer-review
description: >
  Realiza una revisión par técnica y funcional sobre cambios realizados
  en proyectos QA Automation basados en Serenity/JS + Screenplay +
  Playwright + Cucumber + TypeScript. Detecta problemas, genera evidencia,
  clasifica hallazgos y propone soluciones concretas sin modificar código
  automáticamente salvo solicitud explícita.
---

# Serenity Screenplay Peer Review

## Objetivo

Actuar como un revisor par Senior QA Automation sobre cambios realizados
en el repositorio.

La revisión debe evaluar:

- Correctitud funcional.
- Cumplimiento del requerimiento.
- Arquitectura Screenplay.
- Calidad del código.
- Reutilización.
- Mantenibilidad.
- Selectores.
- Sincronización.
- Cobertura de pruebas.
- Escenarios alternativos.
- Casos borde.
- Duplicación.
- Riesgo de regresión.
- Legibilidad.
- Consistencia con el repositorio existente.

El resultado principal debe ser un reporte claro, accionable y respaldado
por evidencia.

---

# Skills relacionadas

Esta skill complementa:

- `serenity-screenplay-scaffold`
- `serenity-screenplay-feature`
- `serenity-screenplay-review`
- `serenity-screenplay-e2e`

No debe duplicar innecesariamente sus responsabilidades.

## serenity-screenplay-scaffold

Usar como referencia para validar:

- estructura del proyecto;
- configuración;
- dependencias;
- scripts;
- Serenity/JS;
- Playwright;
- Cucumber;
- TypeScript.

No reconstruir el framework si ya existe.

## serenity-screenplay-feature

Usar como referencia para determinar cómo debería estar implementado
un escenario o funcionalidad.

Validar especialmente:

Feature
→ Step Definitions
→ Actor
→ Tasks
→ Questions
→ UI
→ Serenity/JS
→ Playwright

Los Step Definitions deben permanecer mínimos.

## serenity-screenplay-review

Usar sus reglas para detectar problemas relacionados con:

- selectores dentro de Steps;
- acceso directo a Playwright desde Steps;
- `page.locator`;
- `page.click`;
- `page.fill`;
- `waitForTimeout`;
- lógica de negocio dentro de Steps;
- Tasks demasiado grandes;
- duplicación;
- bypass del patrón Screenplay;
- XPath frágiles;
- selectores dependientes de clases CSS generadas.

## serenity-screenplay-e2e

Cuando la revisión forme parte del flujo completo, respetar:

scaffold si falta
→ feature
→ exploración Playwright MCP
→ implementación
→ ejecución
→ review
→ peer review
→ correcciones
→ ejecución
→ regresión

---

# Principio principal

No revisar únicamente si el código funciona.

Determinar también:

> ¿Este cambio es correcto, mantenible, reutilizable y consistente con
> la arquitectura existente del proyecto?

---

# 1. Entender el cambio

Antes de emitir hallazgos:

1. Leer el requerimiento.
2. Leer el Feature relacionado.
3. Identificar escenarios afectados.
4. Revisar el código existente relacionado.
5. Identificar archivos modificados.
6. Entender el comportamiento esperado.
7. Comparar comportamiento esperado contra implementación.
8. Buscar implementaciones existentes que puedan reutilizarse.

No asumir que todos los archivos modificados están relacionados entre sí.

---

# 2. Revisar Feature

Validar:

- claridad del Feature;
- lenguaje de negocio;
- Given / When / Then coherentes;
- Scenario Outline correctamente utilizado;
- Examples claros;
- ausencia de detalles técnicos innecesarios;
- cobertura del comportamiento solicitado;
- escenarios positivos;
- escenarios negativos cuando correspondan;
- casos borde relevantes.

Evitar Features acoplados a detalles internos de implementación.

---

# 3. Revisar Step Definitions

Los Steps deben ser mínimos.

Un Step Definition debería principalmente:

1. obtener datos del escenario;
2. delegar acciones al Actor;
3. realizar Questions o assertions cuando corresponda.

Detectar como hallazgo:

```typescript
page.locator(...)
page.click(...)
page.fill(...)
page.waitForTimeout(...)
```

dentro de Step Definitions.

También detectar:

- lógica de negocio;
- loops complejos;
- condicionales extensos;
- transformación excesiva de datos;
- selectores;
- interacción directa con Playwright;
- código duplicado.

---

# 4. Revisar arquitectura Screenplay

## Tasks

Una Task debe representar una intención de negocio.

Ejemplos:

```text
Login
SearchFlight
CreateReservation
AddPassenger
SelectSeat
RetrieveReservation
```

Detectar Tasks que:

- hagan demasiadas cosas;
- representen múltiples intenciones;
- contengan assertions que deberían ser Questions;
- contengan selectores inline;
- dupliquen lógica existente.

## Questions

Las Questions deben consultar el estado de la aplicación.

Ejemplos:

```text
ReservationNumber
DisplayedPassengerName
ReservationStatus
AvailableFlights
ConfirmationMessage
```

Detectar validaciones implementadas directamente en Steps cuando puedan
representarse como Questions.

## UI / Page Elements

Los selectores deben estar centralizados.

Ejemplo:

```typescript
export const LoginPage = {
  username: PageElement.located(By.id('username')),
  password: PageElement.located(By.id('password')),
  loginButton: PageElement.located(By.id('login')),
}
```

No duplicar selectores entre diferentes Tasks.

---

# 5. Revisar selectores

Orden de preferencia:

1. `id`
2. XPath estable
3. atributos estables
4. locators semánticos cuando sean apropiados
5. CSS estable

Evitar:

- clases generadas;
- índices;
- XPath absolutos;
- selectores dependientes de estructura visual;
- textos altamente variables;
- selectores duplicados.

Ejemplo problemático:

```text
/html/body/div[2]/div/div[3]/form/div[4]/button
```

Ejemplo preferido:

```text
//*[@id='loginButton']
```

o:

```text
#loginButton
```

cuando el ID sea estable.

---

# 6. Revisar sincronización

Detectar:

```typescript
waitForTimeout(...)
sleep(...)
setTimeout(...)
```

utilizados para sincronización de UI.

Preferir mecanismos basados en estado:

- Wait.until
- Ensure.that
- visibility
- presence
- enabled
- text
- URL
- condiciones propias de Serenity/JS

La automatización debe esperar condiciones, no tiempos arbitrarios.

---

# 7. Revisar reutilización

Antes de recomendar código nuevo buscar:

- Tasks existentes;
- Questions existentes;
- Interactions existentes;
- UI existente;
- helpers;
- utilidades;
- datos;
- Steps equivalentes.

Reportar duplicación cuando exista una implementación reutilizable.

---

# 8. Revisar calidad del código

Revisar:

- nombres;
- responsabilidad única;
- duplicación;
- complejidad;
- funciones demasiado largas;
- código muerto;
- imports innecesarios;
- constantes mágicas;
- manejo de errores;
- tipado TypeScript;
- uso innecesario de `any`;
- promesas mal manejadas;
- uso correcto de `async/await`.

---

# 9. Riesgo funcional

Analizar si el cambio puede afectar:

- otros escenarios;
- regresión existente;
- datos compartidos;
- autenticación;
- reservas;
- usuarios;
- hooks;
- configuración;
- ejecución paralela;
- persistencia de datos;
- ambientes.

Identificar explícitamente áreas potencialmente afectadas.

---

# Clasificación de hallazgos

## BLOCKER

El cambio no debería integrarse hasta resolverlo.

Ejemplos:

- escenario principal roto;
- test que no puede ejecutarse;
- credenciales expuestas;
- regresión crítica;
- incumplimiento severo de arquitectura.

## HIGH

Problema importante que puede causar errores o regresiones.

Ejemplos:

- flujo incorrecto;
- sincronización inestable;
- selector altamente frágil;
- lógica crítica duplicada;
- manejo incorrecto de estado.

## MEDIUM

Problema de diseño o mantenibilidad que debería corregirse.

Ejemplos:

- lógica en Steps;
- duplicación;
- Task demasiado grande;
- abstracción incorrecta;
- Question faltante.

## LOW

Mejora menor.

Ejemplos:

- naming;
- legibilidad;
- imports;
- simplificaciones.

## SUGGESTION

Oportunidad de mejora que no representa un defecto obligatorio.

---

# Formato obligatorio de cada hallazgo

Cada hallazgo debe contener:

## [SEVERITY] PR-XXX — Título

**Archivo:**  
`ruta/archivo.ts`

**Ubicación:**  
Método, clase o líneas aproximadas.

**Problema:**  
Explicar exactamente qué está mal.

**Evidencia:**

```typescript
// fragmento relevante
```

**Impacto:**  
Explicar qué puede suceder.

**Causa:**  
Explicar por qué ocurre.

**Solución recomendada:**  
Indicar el cambio concreto.

**Ejemplo de solución:**

```typescript
// propuesta concreta
```

**Validación:**  
Explicar cómo comprobar que la solución funciona.

---

# Soluciones

No limitarse a detectar problemas.

Cada hallazgo técnico debe incluir una solución concreta.

La solución debe:

- respetar Screenplay;
- reutilizar código existente;
- minimizar cambios;
- evitar nueva deuda técnica;
- conservar comportamiento válido;
- ser verificable.

Evitar recomendaciones vagas como:

> Mejorar este código.

Preferir:

> Mover el locator a `ReservationPage`, crear una Task
> `RetrieveReservation` y dejar el Step delegando la acción al Actor.

---

# Evitar falsos positivos

Antes de registrar un hallazgo:

1. inspeccionar contexto;
2. revisar implementación relacionada;
3. verificar si existe una razón arquitectónica;
4. comprobar si ya existe una abstracción;
5. diferenciar error de preferencia personal.

No convertir preferencias estilísticas en problemas HIGH o BLOCKER.

---

# Correcciones automáticas

Por defecto:

DO NOT modificar código.

Primero generar el reporte.

Solo modificar archivos cuando el usuario indique explícitamente:

- fix;
- apply fixes;
- corregir;
- solucionar hallazgos;
- implementar recomendaciones.

Cuando se solicite corrección:

1. resolver BLOCKER;
2. resolver HIGH;
3. resolver MEDIUM;
4. resolver LOW cuando sea conveniente;
5. no aplicar automáticamente SUGGESTION salvo indicación explícita.

---

# Validación después de solucionar hallazgos

Después de aplicar correcciones:

1. ejecutar el escenario directamente afectado;
2. ejecutar Features relacionadas;
3. ejecutar regresión relevante;
4. comprobar que no aparecieron nuevos errores;
5. repetir revisión sobre los archivos modificados.

Nunca considerar una corrección completa únicamente porque compile.

---

# Reporte obligatorio

Generar un archivo:

```text
PEER-REVIEW.md
```

con la siguiente estructura:

```markdown
# Peer Review Report

## Summary

Files reviewed: X

Findings: X

BLOCKER: X
HIGH: X
MEDIUM: X
LOW: X
SUGGESTION: X

## Scope

Archivos y funcionalidades revisadas.

## Functional Review

Resultado de la revisión funcional.

## Screenplay Architecture

Resultado de arquitectura.

## Findings

### PR-001 — HIGH — Título

Hallazgo completo.

### PR-002 — MEDIUM — Título

Hallazgo completo.

## Regression Risks

Riesgos encontrados.

## Recommended Fix Order

1. PR-001
2. PR-002

## Tests Recommended

Pruebas que deben ejecutarse.

## Final Status

PASS
PASS WITH OBSERVATIONS
CHANGES REQUIRED
BLOCKED
```

---

# Estados finales

## PASS

No existen hallazgos que requieran modificación.

## PASS WITH OBSERVATIONS

Solo existen LOW o SUGGESTION.

## CHANGES REQUIRED

Existe al menos un HIGH o MEDIUM que debe corregirse.

## BLOCKED

Existe al menos un BLOCKER.

---

# Principio de revisión par

El objetivo no es encontrar la mayor cantidad de errores.

El objetivo es aumentar la confianza en el cambio.

Priorizar:

correctitud
→ estabilidad
→ arquitectura
→ mantenibilidad
→ legibilidad
→ estilo

---

# Salida esperada

Al terminar la revisión mostrar:

```text
Peer Review completed

Files reviewed: X
Findings: X

BLOCKER: X
HIGH: X
MEDIUM: X
LOW: X
SUGGESTION: X

Status: PASS | PASS WITH OBSERVATIONS | CHANGES REQUIRED | BLOCKED

Report:
PEER-REVIEW.md
```

Después presentar primero los hallazgos de mayor severidad.

Nunca ocultar BLOCKER o HIGH entre recomendaciones menores.