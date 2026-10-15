 # Modelo Screenplay en este proyecto

## Qué es Screenplay

Screenplay es una forma de organizar las pruebas automatizadas pensando en **quién** usa la aplicación y **qué quiere lograr**, en lugar de pensar en clics y selectores.

La idea es como un guion de teatro:

- Hay un **actor** (en nuestras pruebas, `Alice`).
- El actor tiene **habilidades** (por ejemplo, navegar en un navegador).
- El actor realiza **tareas** de negocio ("buscar un vuelo", "llenar los pasajeros").
- Cada tarea se compone de **interacciones** pequeñas ("hacer clic", "escribir un texto").
- El actor hace **preguntas** sobre lo que ve en pantalla para comprobar el resultado.

Así, una prueba se lee casi como una historia:

```ts
actor.attemptsTo(
    SearchForFlight.onArajet(booking),
    SelectOutboundFlight.withBundle('Comfort'),
    EnterPassengerInformation.forAll(passengers),
);
```

## Cómo fluye una prueba

```text
 .feature (Gherkin)          Lo que se quiere probar, en lenguaje de negocio
        │
        ▼
 step-definitions            Traduce cada paso de Gherkin a una tarea del actor
        │
        ▼
 Actor + Abilities           Alice, que sabe usar el navegador (Playwright)
        │
        ▼
 Tasks                       Acciones de negocio: buscar vuelo, elegir tarifa, llenar pasajeros
        │
        ▼
 Interactions                Acciones pequeñas: clic, escribir, esperar, elegir una opción
        │
        ▼
 UI (selectores)             Dónde está cada elemento en la página de Arajet

 Questions                   Lo que el actor consulta para validar (textos, URL, estado de botones)
 Test data                   Los datos que se usan (rutas, fechas, pasajeros)
```

## Qué hace cada carpeta

| Carpeta | Responsabilidad | Ejemplos en el proyecto |
|---|---|---|
| `features/*.feature` | Describe los escenarios en lenguaje de negocio (Gherkin) y las combinaciones de datos en la tabla `Examples`. | `arajet-flight-reservation.feature` |
| `features/step-definitions/` | Conecta cada frase de Gherkin con una tarea o pregunta. No tiene lógica de la página. | `arajet-flight-reservation.steps.ts`, `parameter.steps.ts` (define `{actor}` y `{pronoun}`) |
| `features/support/` | Configuración de la ejecución: navegador, actores y reporte Serenity BDD. | `serenity.config.ts` |
| `src/screenplay/abilities/` | Le da al actor sus habilidades. Aquí, usar el navegador con Playwright. | `AutomationActors.ts` |
| `src/screenplay/tasks/` | Acciones de negocio. Cada tarea agrupa varias interacciones. | `OpenArajet`, `SearchForFlight`, `SelectFlight`, `EnterPassengerInformation` |
| `src/screenplay/interactions/` | Acciones pequeñas y reutilizables sobre la página, incluyendo esperas especiales que necesita Arajet. | `ClickWithPlaywright`, `SelectOptionWithPlaywright`, `SelectAdultsWithPlaywright`, `OpenDatePickerWithPlaywright` |
| `src/screenplay/questions/` | Lo que el actor puede consultar para validar resultados. | `OutboundFlightResults`, `BookedAdults`, `PassengerSubmitButtonState` |
| `src/screenplay/ui/` | Selectores de cada pantalla. Es el **único** lugar donde se dice cómo encontrar un elemento. | `ArajetFlightSearchUI`, `ArajetFlightResultsUI`, `ArajetPassengerUI` |
| `src/screenplay/test-data/` | Construcción de los datos de prueba. | `ArajetBookingData` (ruta, fechas, tarifa, adultos), `ArajetPassengerData` (pasajeros con Faker), `passenger-names.json` |
| `src/config/` | Valores de entorno: URL, modo headless, tiempos de espera, semilla de Faker. | `environment.ts` |

## Ejemplo completo: de Gherkin al navegador

En el `.feature`:

```gherkin
When Alice searches for a round trip using:
  | field       | value  |
  | origin      | MIA    |
  | destination | PUJ    |
  | outDay      | 15     |
  | arrivalDay  | 22     |
  | bundle      | Comfort|
  | adults      | 2      |
```

1. El **step definition** lee la tabla y arma los datos con `buildArajetBookingData` (convierte "15 días desde hoy" en una fecha real y valida los valores).
2. Le pide a Alice la **tarea** `SearchForFlight.onArajet(booking)`.
3. La tarea ejecuta, en orden, las **interacciones**: elegir origen, elegir destino, abrir el calendario, elegir las dos fechas, elegir la cantidad de adultos y pulsar "Search flights".
4. Cada interacción busca los elementos usando los selectores de **UI** (`ArajetFlightSearchUI`).
5. Después, el paso `Then she should see available outbound flights` usa la **pregunta** `OutboundFlightResults` para comprobar que apareció la pantalla de vuelos.

## Por qué este modelo sirve para muchos casos y muchas rutas

### 1. Una ruta nueva es una fila nueva, no código nuevo

Las tareas reciben los datos como parámetros. El mismo escenario sirve para cualquier ruta, fecha, tarifa o cantidad de pasajeros:

```gherkin
Examples:
  | origin | destination | outDay | arrivalDay | bundle  | adults |
  | MIA    | PUJ         | 15     | 22         | Comfort | 2      |
  | MIA    | PUJ         | 20     | 27         | Comfort | 3      |
  | SDQ    | BOG         | 30     | 37         | Basic   | 1      |
```

Cada fila es un caso de prueba independiente y aparece por separado en el reporte. Para probar más combinaciones solo se agregan filas. (La fila SDQ → BOG es solo un ejemplo del formato; antes de usar una ruta nueva hay que confirmar que Arajet la opera en esas fechas.)

### 2. Los cambios de la página se arreglan en un solo lugar

Si Arajet cambia un botón o un campo, solo se actualiza el selector en `src/screenplay/ui/`. Todas las pruebas que lo usan quedan corregidas a la vez, sin tocar escenarios ni tareas.

### 3. Las piezas se reutilizan

`SearchForFlight` es la misma tarea para todos los escenarios. Un escenario nuevo (por ejemplo, "buscar solo ida" o "seleccionar asientos") se arma combinando tareas que ya existen y agregando solo lo que falta. Por ejemplo, `SelectSeats` y `ContinueToSeatSelection` ya están listas para cuando se quiera volver a probar la selección de asientos.

### 4. Los datos variables no ensucian las pruebas

- Las fechas se escriben como "días desde hoy", así las pruebas no se vencen.
- Los pasajeros se generan con Faker y nombres desde `passenger-names.json`. Cada ejecución usa datos distintos, y con `FAKER_SEED` se puede repetir una ejecución exacta.
- Las validaciones de datos (tarifa válida, regreso después de la ida, entre 1 y 20 adultos) están en `ArajetBookingData`, no repartidas por las pruebas.

### 5. Los problemas técnicos quedan encapsulados

Arajet tiene comportamientos difíciles de automatizar: la lista de destinos que se recarga, el calendario que se abre solo, el overlay de carga y los formularios de pasajero que aparecen uno por uno. Todo eso está resuelto dentro de las **interacciones**. Las tareas y los escenarios no necesitan saberlo.

### 6. El reporte se entiende sin leer código

Como cada tarea e interacción tiene una descripción ("Alice selects MIA airport option", "Alice enters \"Bruce\" into first name field"), el reporte de Serenity BDD muestra paso a paso lo que hizo el actor, con tiempos y capturas en caso de fallo. Cualquier persona del equipo, técnica o no, puede entender qué pasó.

## Cómo agregar casos

| Quiero... | Qué hago |
|---|---|
| Probar otra ruta, fecha, tarifa o cantidad de adultos | Agrego una fila en `Examples` del `.feature`. |
| Agregar nombres de pasajeros | Agrego un objeto en `passenger-names.json` con `firstName`, `lastName` y `gender`. |
| Validar algo nuevo en pantalla | Creo una pregunta en `questions/` y la uso en un paso `Then`. |
| Probar un flujo nuevo | Creo la tarea en `tasks/`, los selectores que falten en `ui/` y un escenario nuevo en el `.feature`. |
| Corregir un selector que cambió | Lo actualizo solo en el archivo correspondiente de `ui/`. |

## Tener en cuenta

- La ruta y las fechas tienen que tener vuelos disponibles en Arajet; si no, el escenario falla en la búsqueda.
- La tarifa (`Basic`, `Comfort`, `Extra`) tiene que existir para el vuelo elegido.
- El guardado de pasajeros está protegido por Cloudflare. Ver [arajet-cloudflare.md](arajet-cloudflare.md).
