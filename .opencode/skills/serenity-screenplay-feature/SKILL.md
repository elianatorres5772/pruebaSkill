---
name: serenity-screenplay-feature
description: Implements automated Cucumber scenarios using Serenity/JS Screenplay, Playwright, TypeScript, pnpm and the project's Gherkin and locator conventions.
---

# Serenity/JS Screenplay Feature

Use this skill whenever implementing or modifying an automated business flow.

The project uses:

- TypeScript
- pnpm
- Cucumber
- Serenity/JS
- Screenplay Pattern
- Playwright
- Playwright MCP

The purpose of this skill is to create maintainable, reusable and data-driven
automation while preserving the existing project architecture.

---

# 1. Before implementing

Before creating or modifying code:

1. Read the requirement.
2. Inspect the existing project.
3. Inspect existing Feature files.
4. Inspect existing Step Definitions.
5. Inspect existing Tasks.
6. Inspect existing Questions.
7. Inspect existing Interactions.
8. Inspect existing UI definitions.
9. Inspect existing test data.
10. Reuse existing components whenever possible.

Do not create duplicate automation components when an equivalent component
already exists.

---

# 2. Required architecture

Always preserve this architecture:

Feature
-> Step Definition
-> Actor
-> Task
-> Interaction
-> UI

For validations:

Feature
-> Step Definition
-> Actor
-> Ensure
-> Question
-> UI

Do not bypass Screenplay without justification.

---

# 3. Gherkin conventions

Feature files must describe business behaviour.

Use when appropriate:

- Feature
- As a
- I want
- So that
- Background
- Scenario
- Scenario Outline
- Examples
- DataTable
- Given
- When
- Then
- And

Do not include implementation details in Gherkin.

Do not include:

- selectors
- IDs
- XPath
- CSS
- Playwright methods
- DOM implementation details

---

# 4. Preferred Feature model

For reservation flows, prefer a structure similar to:

Feature: make flight reservations

  As a passenger
  I want to make my reservation
  So that I can complete a booking

  Background:
    Given the user is on the airline portal

  Scenario Outline: Successful booking flow for multiple reservation configurations

    When the user enters the username and password
    And the user logs into the reservation portal

    And the user creates the reservation using:
      | field       | value         |
      | typeFlight  | <typeFlight>  |
      | origin      | <origin>      |
      | destination | <destination> |
      | currency    | <currency>    |
      | adults      | <adults>      |
      | children    | <children>    |
      | infants     | <infants>     |
      | outDay      | <outDay>      |
      | arrivalDay  | <arrivalDay>  |
      | flow        | <flow>        |

    And the user enters passenger information for "<typeFlight>"
    And the user continues through the "<flow>" reservation flow
    And the user decides whether to select seats using "<buySeat>"
    And the user selects the allowed bundle "<bundle>"

    Then the reservation should reach the expected state for "<flow>"

    Examples:
      | typeFlight | origin | destination | currency | adults | children | infants | outDay | arrivalDay | flow     | buySeat | bundle |
      | RoundTrip  | MDE    | SDQ         | USD      | 1      | 0        | 0       | 15     | 22         | standard | true    | Smart  |

This is a reference model.

Adapt it to the actual application and requirement.

Do not create parameters that are not used by the scenario.

---

# 5. Scenario Outline rules

Prefer Scenario Outline when:

- the business flow remains the same
- test data changes
- several booking combinations need to be tested
- origin/destination combinations vary
- passenger combinations vary
- bundle or flow configuration varies

Use placeholders such as:

<typeFlight>
<origin>
<destination>
<currency>
<adults>
<children>
<infants>
<outDay>
<arrivalDay>
<flow>
<buySeat>
<bundle>

Only include values needed by the current scenario.

Avoid duplicating entire scenarios when only test data changes.

---

# 6. DataTable rules

Use DataTable when several related values belong to the same business action.

Example:

And the user creates the reservation using:
  | field       | value         |
  | typeFlight  | <typeFlight>  |
  | origin      | <origin>      |
  | destination | <destination> |
  | currency    | <currency>    |
  | adults      | <adults>      |
  | children    | <children>    |
  | infants     | <infants>     |
  | outDay      | <outDay>      |
  | arrivalDay  | <arrivalDay>  |

Transform the DataTable in the Step Definition into a typed data object.

Do not pass raw tables deeply into Tasks.

Preferred flow:

DataTable
-> Step Definition
-> typed booking data object
-> Task

---

# 7. Step Definition rules

Step Definitions must remain thin.

They may:

- receive Gherkin parameters
- receive DataTables
- transform DataTables
- obtain the current actor
- invoke Tasks
- invoke Questions
- invoke Ensure assertions

They must not contain:

- selectors
- By.id
- By.xpath
- page.locator
- page.click
- page.fill
- direct Playwright flows
- waitForTimeout
- complex business logic

Bad:

When('the user logs in', async () => {
    await page.locator('#username').fill(username)
    await page.locator('#password').fill(password)
    await page.locator('#login').click()
})

Preferred:

When('the user logs in', async () => {
    await actorInTheSpotlight().attemptsTo(
        Login.withCredentials(username, password)
    )
})

---

# 8. Tasks

Tasks represent business-level activities.

Examples:

- Login
- SearchForFlight
- SelectOutboundFlight
- SelectReturnFlight
- SelectFare
- EnterPassengerInformation
- SelectBundle
- ContinueToSeatSelection
- SelectSeat

Tasks must:

- represent business intent
- have one clear responsibility
- be reusable
- compose Serenity/JS Interactions
- compose existing Tasks when appropriate

Do not create giant Tasks containing the entire E2E flow.

Prefer:

SearchForFlight

SelectFlight

SelectBundle

EnterPassengerInformation

SelectSeat

instead of:

CompleteEntireReservation

when the flow can be decomposed into reusable business actions.

---

# 9. Interactions

Interactions represent reusable low-level browser actions.

Create custom Interactions only when Serenity/JS does not already provide
a suitable interaction.

Examples:

- SelectTravelDate
- SelectPassengerQuantity
- SelectAvailableSeat
- ClearAndEnterValue

Do not use Interactions to represent complete business flows.

Do not duplicate existing Serenity/JS Interactions unnecessarily.

---

# 10. Questions

Questions retrieve observable application state.

Examples:

- AvailableFlights
- SelectedFlight
- SelectedFare
- PassengerSummary
- AvailableSeats
- SelectedSeat
- ReservationSummary
- ConfirmationMessage

Questions must:

- retrieve state
- remain reusable
- use UI definitions
- avoid changing application state

Questions must not:

- click
- type
- select
- navigate

Use Questions with Serenity/JS Ensure for validations.

---

# 11. UI definitions

All selectors belong in UI definitions.

Expected structure:

src/
└── screenplay/
    └── ui/
        ├── LoginUI.ts
        ├── FlightSearchUI.ts
        ├── FlightResultsUI.ts
        ├── FareSelectionUI.ts
        ├── PassengerInformationUI.ts
        └── SeatMapUI.ts

Do not place selectors inside:

- Feature files
- Step Definitions
- Tasks
- Questions
- test data

Questions and Tasks should reference UI elements.

---

# 12. Locator strategy

The selector priority for this project is:

1. Stable ID
2. Stable relative XPath
3. Other stable selector only when ID or XPath is not appropriate

---

# 13. ID selector rules

Always prefer ID when:

- the element has an ID
- the ID is unique
- the ID is stable
- the ID is predictable
- the ID does not change between executions

Preferred:

By.id('username')

By.id('password')

By.id('origin')

By.id('destination')

By.id('searchButton')

Example:

PageElement
    .located(By.id('origin'))
    .describedAs('origin field')

Do not use an ID only because one exists.

First verify that the ID is stable.

---

# 14. Dynamic ID rules

Avoid dynamically generated IDs.

Potentially unstable examples:

input-827364

react-select-15-input

element_92831

field_837262

If an ID changes between page loads or sessions, do not use it.

Use a stable relative XPath instead.

---

# 15. XPath selector rules

Use XPath when:

- no stable ID exists
- visible text is the most stable reference
- the element depends on another stable element
- a stable DOM relationship is required
- available attributes are more reliable than generated classes

Prefer relative XPath.

Good:

//button[normalize-space()='Continue']

//button[@type='submit']

//label[normalize-space()='Origin']/following::input[1]

//div[@data-flight='MDE-SDQ']//button[contains(., 'Select')]

//div[contains(@class,'seat') and @data-status='available']

Avoid absolute XPath:

/html/body/div[2]/div/div[3]/div[1]/button

Avoid unnecessary indexes:

(//button)[17]

Avoid DOM-position dependent XPath when a semantic alternative exists.

---

# 16. Locator decision process

For every element:

Does a stable unique ID exist?

YES
-> use By.id(...)

NO
-> identify a stable relative XPath
-> use By.xpath(...)

If neither option is reliable:

-> use another stable selector
-> document the reason when appropriate

Do not use unstable selectors simply to make the automation pass.

---

# 17. Playwright MCP

Use Playwright MCP when application exploration is required.

Use MCP to:

- open the application
- navigate through the business flow
- inspect the DOM and accessible elements
- understand application behaviour
- identify available IDs
- identify possible stable XPath relationships
- understand loaders
- inspect dynamic content
- identify validation states
- inspect seat maps
- confirm expected behaviour

MCP is for exploration and discovery.

Do not copy procedural MCP actions directly into the final automation.

Translate MCP findings into:

Feature
-> Step Definition
-> Task
-> Interaction
-> UI

For validations:

Question
-> UI

---

# 18. MCP locator discovery

When MCP identifies an element:

1. Inspect whether a stable ID exists.
2. Verify that the ID does not appear dynamically generated.
3. If stable, use By.id.
4. Otherwise identify a stable relative XPath.
5. Avoid copying temporary selectors from MCP.
6. Store the final selector in the UI layer.

---

# 19. Reuse

Before creating a new:

- Feature
- Step Definition
- Task
- Interaction
- Question
- UI definition
- test data object

search the repository for an existing equivalent.

Avoid duplication.

Do not create:

LoginAsAdmin

LoginAsUser

LoginAsAgent

when a reusable component is sufficient:

Login.withCredentials(username, password)

Reuse and parameterize whenever possible.

---

# 20. Test data

Do not hardcode real personal information.

Prefer:

- Scenario Outline Examples
- DataTables
- fixtures
- builders
- typed test data objects
- generated test data when appropriate

Do not hardcode credentials in Tasks or Step Definitions.

Do not hardcode dates that will expire.

For travel automation, prefer dynamic future dates when appropriate.

Example:

outDay = today + 15 days

arrivalDay = today + 22 days

The Gherkin can still express business-relative values when the project
convention requires them.

---

# 21. Flow parameter

When the project uses a parameter such as:

<flow>

use it to represent meaningful booking variations.

Examples may include:

standard

roundTrip

oneWay

withSeat

withoutSeat

withBundle

Do not use arbitrary flow values without documenting their business meaning.

Prefer typed handling after Step Definition parsing.

---

# 22. buySeat parameter

When using:

<buySeat>

treat it as a configuration parameter controlling seat selection behaviour.

Example:

true
-> execute the seat selection Task

false
-> skip seat selection according to the business flow

Do not duplicate complete scenarios only to represent this variation when
Scenario Outline can express it cleanly.

---

# 23. Bundle parameter

When using:

<bundle>

use it to select a business fare/bundle option.

Examples:

Basic

Classic

Comfort

Smart

Only use actual bundle names discovered in the application.

Do not invent application data.

---

# 24. Waiting strategy

Never use:

waitForTimeout

sleep

fixed arbitrary delays

Prefer synchronization based on application state.

Examples:

- element visibility
- enabled state
- expected text
- navigation
- loader disappearance
- expected UI state
- Serenity/JS interaction synchronization

---

# 25. Browser

Use the locally installed Google Chrome.

When browser configuration is required:

channel: 'chrome'

Do not download Chromium unless explicitly requested.

---

# 26. Package manager

Use pnpm exclusively.

Allowed:

pnpm add
pnpm install
pnpm exec
pnpm dlx

Do not use:

npm install
npx
yarn

unless explicitly requested.

---

# 27. Implementation workflow

When implementing a new feature:

1. Read the requirement.
2. Inspect the repository.
3. Identify reusable components.
4. Use Playwright MCP when exploration is needed.
5. Understand the complete functional flow.
6. Identify stable IDs.
7. Identify stable XPath when IDs are unavailable.
8. Propose the Gherkin scenario.
9. Create or update the Feature.
10. Create minimal Step Definitions.
11. Create or reuse typed data objects.
12. Create or reuse Tasks.
13. Create Interactions only when necessary.
14. Create or reuse Questions.
15. Create or update UI definitions.
16. Execute the scenario.
17. Fix automation errors.
18. Execute related regression tests.
19. Run serenity-screenplay-review when requested or when using the E2E orchestrator.

---

# 28. Incremental implementation

For long E2E flows, implement incrementally.

Example:

Stage 1
Home
-> Search
-> Results

Stage 2
Results
-> Flight Selection

Stage 3
Flight Selection
-> Bundle

Stage 4
Passenger Information

Stage 5
Seat Map

Stage 6
Seat Selection

Each stage should work before adding the next stage.

Reuse everything created in previous stages.

Do not regenerate the same components for each stage.

---

# 29. Execution

After implementing a scenario:

1. Run the relevant test.
2. Inspect failures.
3. Determine whether the problem is:
   - automation
   - locator
   - data
   - environment
   - application behaviour
4. Fix automation issues.
5. Run again.
6. Run related regression tests when appropriate.

Do not change expected application behaviour simply to make the test pass.

---

# 30. Final implementation report

When implementation is complete, report:

## Scenario implemented

Describe the automated business flow.

## Gherkin

Indicate:

- Scenario or Scenario Outline
- Examples used
- DataTables used

## Reused components

List reused:

- Tasks
- Interactions
- Questions
- UI definitions
- Step Definitions

## Created components

List new:

- Feature files
- Step Definitions
- Tasks
- Interactions
- Questions
- UI definitions
- test data objects

## Selectors

For important new selectors indicate:

- element
- selector type
- ID or XPath
- reason

Example:

Origin field
-> ID
-> By.id('origin')

Continue button
-> XPath
-> //button[normalize-space()='Continue']
-> no stable ID available

## Tests executed

Show the pnpm commands executed.

## Results

Report:

- passed
- failed
- skipped

## Remaining issues

Report any unresolved:

- application defects
- unstable selectors
- CAPTCHA
- environment issues
- anti-bot protection
- incomplete flows

Never claim success without executing the relevant scenario.