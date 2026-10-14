---
name: serenity-screenplay-review
description: Reviews Serenity/JS Screenplay Cucumber automation for architecture violations, Gherkin quality, selector strategy, duplication, maintainability and execution issues.
---

# Serenity/JS Screenplay Review

Use this skill when reviewing, validating or refactoring automation code.

The project uses:

- TypeScript
- pnpm
- Cucumber
- Serenity/JS
- Screenplay Pattern
- Playwright
- Playwright MCP

The purpose of this skill is to verify that the automation follows the
project architecture and remains reusable, maintainable and stable.

---

# 1. Review scope

Inspect when relevant:

- Feature files
- Scenario Outlines
- Examples
- DataTables
- Step Definitions
- Tasks
- Interactions
- Questions
- UI definitions
- abilities
- hooks
- test data
- Cucumber configuration
- Serenity/JS configuration
- TypeScript configuration
- package.json
- execution scripts

Do not review only the file recently modified.

Inspect related components when necessary to detect duplication or
architectural inconsistencies.

---

# 2. Expected architecture

The preferred flow is:

Feature
-> Step Definition
-> Actor
-> Task
-> Interaction
-> UI

For validation:

Feature
-> Step Definition
-> Actor
-> Ensure
-> Question
-> UI

Do not allow business flows to bypass Screenplay without justification.

---

# 3. Feature and Gherkin review

Verify that Feature files describe business behaviour and not technical
implementation.

Preferred elements:

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

## Scenario Outline

Prefer Scenario Outline when the same business flow must run with
different combinations of test data.

Example parameters may include:

- typeFlight
- origin
- destination
- currency
- adults
- children
- infants
- outDay
- arrivalDay
- flow
- buySeat
- bundle

Only include parameters that are actually required.

## DataTable

Use DataTable when several related values belong to the same business action.

Example:

| field       | value         |
| typeFlight  | <typeFlight>  |
| origin      | <origin>      |
| destination | <destination> |
| currency    | <currency>    |

## Review Gherkin for

Report:

- technical selectors inside Gherkin
- CSS
- XPath
- element IDs
- implementation details
- duplicated steps with slightly different wording
- giant steps containing several unrelated business actions
- confusing Given / When / Then semantics
- hardcoded test data that should be parameterized
- Scenario Outline without meaningful Examples
- unused parameters
- inconsistent parameter names
- duplicated scenarios with only data changes

Prefer business-readable language.

For example:

Bad:

When the user clicks the button with id searchButton

Preferred:

When the user searches for the configured flight

---

# 4. Step Definition review

Step Definitions must remain thin.

They may:

- receive Gherkin parameters
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
- direct browser workflows
- waitForTimeout
- complex business logic
- duplicated navigation logic

Example of a violation:

When('the user logs in', async () => {
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#login').click();
});

Preferred approach:

When('the user logs in', async () => {
    await actorInTheSpotlight().attemptsTo(
        Login.withCredentials(username, password)
    );
});

---

# 5. Task review

Tasks represent business activities.

Examples:

- Login
- SearchForFlight
- SelectOutboundFlight
- SelectReturnFlight
- SelectFare
- EnterPassengerInformation
- ContinueToSeatSelection
- SelectSeat

Check that Tasks:

- have one clear responsibility
- describe business intent
- compose reusable Interactions
- reuse existing Tasks where possible
- do not duplicate existing behaviour
- do not contain unrelated assertions
- do not become giant workflow classes

Report Tasks that:

- contain multiple unrelated responsibilities
- duplicate another Task
- contain selectors directly when they should reference UI definitions
- implement validations that belong to Questions
- contain hardcoded test data
- call arbitrary waits

---

# 6. Interaction review

Interactions represent reusable low-level actions.

Examples:

- SelectDate
- SelectPassengerCount
- ChooseAvailableSeat
- ClearAndEnterValue

Create custom Interactions only when Serenity/JS does not already provide
a suitable abstraction.

Report:

- unnecessary custom Interactions
- duplicated Interactions
- business workflows incorrectly implemented as Interactions
- selectors scattered inside multiple Interactions
- hardcoded waits

---

# 7. Question review

Questions represent application state.

Examples:

- AvailableFlights
- SelectedFlight
- SelectedFare
- PassengerSummary
- AvailableSeats
- SelectedSeat
- ConfirmationMessage

Check that Questions:

- represent observable application state
- are reusable
- use UI definitions
- do not modify application state
- do not perform business actions

Report:

- Questions that click or type
- Questions that duplicate other Questions
- assertions embedded in unrelated Tasks
- validation logic duplicated across Step Definitions

Prefer:

Ensure.that(
    SelectedSeat.value(),
    equals(expectedSeat)
)

over procedural assertions spread through the test.

---

# 8. UI definition review

Selectors must be centralized in UI definitions.

Expected location:

src/
└── screenplay/
    └── ui/

Examples:

- FlightSearchUI
- FlightResultsUI
- FareSelectionUI
- PassengerInformationUI
- SeatMapUI

Selectors must not be duplicated across:

- Step Definitions
- Tasks
- Questions
- Interactions

unless there is a justified reason.

---

# 9. Locator strategy

The project selector priority is:

1. Stable ID
2. Stable relative XPath
3. Other stable selectors only when ID or XPath is not appropriate

---

## ID rules

Prefer ID when the element has an ID that is:

- unique
- stable
- predictable
- not dynamically generated

Preferred example:

By.id('origin')

By.id('destination')

By.id('searchButton')

Report when a stable ID exists but a more fragile selector is used
without justification.

---

## Dynamic ID rules

Do not use IDs that appear generated or change between executions.

Examples of potentially unstable IDs:

input-738291

react-select-15-input

element_928374

dynamic_control_7262

If the ID changes across sessions, prefer a stable relative XPath.

---

# 10. XPath rules

Use XPath when:

- no stable ID exists
- the element must be located by visible text
- the element depends on another element
- a stable relationship in the DOM is required
- attributes are more reliable than generated classes

Prefer relative XPath.

Good:

//button[normalize-space()='Continue']

//button[@type='submit']

//label[normalize-space()='Origin']/following::input[1]

//div[@data-flight='MDE-SDQ']//button[contains(., 'Select')]

//div[contains(@class,'seat') and @data-status='available']

Avoid absolute XPath:

/html/body/div[2]/div/div[3]/div[1]/button

Avoid unnecessarily indexed XPath:

(//button)[17]

Avoid DOM-position dependent XPath when a semantic alternative exists.

Report:

- absolute XPath
- brittle DOM traversal
- unnecessary indexes
- XPath using dynamic values
- selectors that depend on generated classes
- duplicated XPath

---

# 11. MCP locator review

Playwright MCP can be used to discover application elements.

However, selectors generated or discovered during MCP exploration must
be reviewed before becoming permanent automation selectors.

For every important element:

1. Check whether a stable ID exists.
2. Prefer the stable ID.
3. If no stable ID exists, create a stable relative XPath.
4. Avoid temporary selectors created only for the MCP exploration session.
5. Store the final selector in the UI layer.

Do not accept an MCP-generated selector automatically without assessing
its stability.

---

# 12. Selector review decision

Apply this decision process:

Does the element have a stable unique ID?

YES
-> use By.id(...)

NO
-> identify a stable relative XPath
-> use By.xpath(...)

If neither is appropriate:

-> use another stable selector
-> document why it was necessary

---

# 13. Test data review

Test data must not contain real personal information unless explicitly
required and approved.

Prefer:

- Scenario Outline Examples
- DataTables
- fixtures
- builders
- test data objects
- generated test data

Report:

- personal data hardcoded in Tasks
- credentials hardcoded in source code
- duplicated booking data
- fixed dates that will expire
- environment-specific values embedded in Screenplay components

Dates should preferably be calculated dynamically when the business flow
requires future travel dates.

---

# 14. Reuse review

Before accepting a new:

- Task
- Interaction
- Question
- UI definition
- Step Definition

search for an existing equivalent.

Report:

- duplicated Tasks
- duplicated Questions
- duplicated selectors
- duplicated Step Definitions
- duplicated workflows
- slightly renamed components performing the same action

Prefer reuse or parameterization instead of duplication.

Example:

Avoid:

LoginAsAdmin
LoginAsUser
LoginAsAgent

when this is sufficient:

Login.withCredentials(username, password)

---

# 15. Naming review

Names must describe business intent.

Preferred:

SearchForFlight

SelectFare

EnterPassengerInformation

SelectAvailableSeat

AvailableFlights

SelectedSeat

Avoid vague names:

DoAction

ClickButton

ProcessData

TestUtils

CommonActions

Helper1

---

# 16. Waiting strategy

Do not use:

waitForTimeout

sleep

arbitrary fixed delays

Prefer application-state-based synchronization.

Wait for:

- visibility
- availability
- navigation
- state change
- expected text
- enabled state
- network-driven UI state

Report every unnecessary fixed wait.

---

# 17. Error handling review

Do not hide failures.

Report code that:

- catches exceptions and ignores them
- converts test failures into successful execution
- retries actions indefinitely
- continues after a critical validation failure
- changes expected behaviour just to make a test pass

A product defect must not be hidden by changing the automation expectation.

---

# 18. Browser and Playwright review

The project uses the locally installed Google Chrome.

Do not introduce Chromium downloads unless explicitly requested.

When browser configuration is required, prefer:

channel: 'chrome'

Playwright is the browser engine.

Do not replace the Screenplay architecture with regular procedural
@playwright/test scripts unless explicitly requested.

---

# 19. Package manager review

The project uses pnpm exclusively.

Allowed:

pnpm add

pnpm install

pnpm exec

pnpm dlx

Do not introduce:

npm install

npx

yarn

unless explicitly requested.

---

# 20. Architecture violations to report

Always report when found:

- selectors in Step Definitions
- selectors in Feature files
- direct Playwright page calls inside steps
- direct Playwright workflows replacing Tasks
- business logic inside Step Definitions
- duplicated Tasks
- duplicated Questions
- duplicated Interactions
- duplicated selectors
- giant Tasks
- giant Step Definition files
- absolute XPath
- dynamic IDs
- unnecessary XPath indexes
- generated CSS classes
- waitForTimeout
- technical Gherkin
- hardcoded credentials
- hardcoded personal data
- fixed travel dates that will expire
- Page Object workflows replacing Screenplay architecture
- Questions that modify application state
- Tasks containing unrelated assertions

---

# 21. Review severity

Classify findings as:

CRITICAL

The test architecture or execution is fundamentally incorrect.

Examples:

- test cannot execute
- credentials exposed
- Step Definitions implement the complete browser flow
- automation performs unintended destructive actions

HIGH

Significant maintainability or reliability issue.

Examples:

- duplicated business Tasks
- dynamic selectors
- absolute XPath
- hardcoded waits
- major Screenplay violation

MEDIUM

Design issue that should be corrected.

Examples:

- Task has too many responsibilities
- duplicated Step wording
- reusable Question not extracted

LOW

Minor improvement.

Examples:

- naming
- formatting
- organization
- small readability issue

---

# 22. Refactoring workflow

When asked to fix review findings:

1. Inspect all related files.
2. Preserve business behaviour.
3. Reuse existing components.
4. Move selectors to UI definitions.
5. Prefer stable ID.
6. Use stable relative XPath when ID is unavailable.
7. Move business actions to Tasks.
8. Move state retrieval to Questions.
9. Extract reusable Interactions only when justified.
10. Remove duplication.
11. Remove fixed waits.
12. Keep Step Definitions thin.
13. Preserve the Gherkin business language.
14. Execute the affected scenario.
15. Fix compilation or automation failures.
16. Run related regression tests.

Never change expected application behaviour only to make the test pass.

---

# 23. Execution review

After refactoring, execute the relevant automated scenario.

Use the project's existing pnpm test command.

If there is no dedicated script, use the appropriate pnpm exec command.

Do not state that the review or refactoring was successful without
executing the affected tests.

Report:

- executed command
- passed tests
- failed tests
- skipped tests
- unresolved issues

---

# 24. Final review report

When completing a review, provide a concise report containing:

## Architecture

Screenplay violations found.

## Gherkin

Issues related to Scenario Outline, DataTables, Examples and step quality.

## Reuse

Duplicated or reusable components found.

## Selectors

For every relevant selector issue indicate:

- current selector
- recommended selector
- ID available: yes/no
- XPath required: yes/no
- stability concern

## Test data

Hardcoded or unstable data found.

## Execution

Tests executed and results.

## Findings

Group findings by:

- CRITICAL
- HIGH
- MEDIUM
- LOW

## Changes

If fixes were requested, list modified files and summarize the changes.

## Remaining issues

Clearly identify issues that require manual decision or application changes.

Do not claim that the automation is fully correct unless the relevant
tests were successfully executed.opencode reload
