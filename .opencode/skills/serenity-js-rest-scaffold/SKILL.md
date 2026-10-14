---
name: serenity-js-rest-scaffold
description: Creates and configures a TypeScript API automation framework using Serenity/JS REST, Screenplay, Cucumber and pnpm.
---

# Serenity/JS REST Scaffold

Use this skill when creating or configuring the API automation framework.

The required stack is:

- TypeScript
- pnpm
- Cucumber
- Serenity/JS
- Screenplay Pattern
- @serenity-js/rest
- @serenity-js/assertions
- Axios
- Serenity/JS reporting

The API framework must coexist with the existing web automation framework.

Do not remove or break:

- Playwright configuration
- Playwright MCP
- existing web Features
- existing Screenplay web components
- existing OpenCode skills

# 1. Before modifying the project

Inspect:

- package.json
- pnpm-lock.yaml
- tsconfig.json
- cucumber configuration
- Serenity/JS configuration
- existing features
- existing Screenplay structure
- environment configuration

Identify which dependencies already exist.

Install only missing dependencies.

Use pnpm exclusively.

Do not use:

- npm
- npx
- yarn

# 2. Required dependencies

The API framework may require:

- @cucumber/cucumber
- @serenity-js/core
- @serenity-js/cucumber
- @serenity-js/rest
- @serenity-js/assertions
- @serenity-js/console-reporter
- @serenity-js/html-reporter
- axios
- typescript
- ts-node
- @types/node

Do not reinstall dependencies that already exist.

# 3. Preferred API architecture

Use a structure similar to:

features/
└── api/
    ├── reservation/
    │   └── reservation.feature
    ├── step-definitions/
    └── support/

src/
└── api/
    ├── tasks/
    ├── interactions/
    ├── questions/
    ├── endpoints/
    ├── models/
    ├── requests/
    ├── responses/
    ├── data/
    └── utils/

schemas/
└── api/

Do not create empty folders unless they have a clear expected use.

Adapt the structure to the existing repository.

# 4. Screenplay architecture

Preferred request flow:

Feature
-> Step Definition
-> Actor
-> Task
-> Send
-> HTTP Request
-> API

Validation flow:

Feature
-> Step Definition
-> Actor
-> Ensure
-> Question / LastResponse
-> API response

# 5. Actor API ability

API actors must use:

CallAnApi

The base URL must come from configuration or environment variables.

Do not hardcode environment-specific URLs in Tasks.

Preferred concept:

CallAnApi.at(process.env.API_BASE_URL)

Never hardcode:

- production URLs
- credentials
- tokens
- cookies
- API keys

# 6. HTTP requests

Use @serenity-js/rest interactions such as:

- Send.a(...)
- GetRequest
- PostRequest
- PutRequest
- PatchRequest
- DeleteRequest

Do not call Axios directly from Step Definitions.

Do not put complete HTTP request logic inside Cucumber steps.

# 7. Endpoints

Centralize reusable endpoint paths.

Example responsibilities:

ReservationEndpoints
FlightEndpoints
SeatEndpoints

Avoid repeating endpoint strings across Tasks.

Do not include environment hostnames in endpoint definitions.

# 8. Models

Use typed TypeScript models or interfaces for request and response data
when doing so improves maintainability.

Avoid `any` unless no reasonable type exists.

Separate:

- request models
- response models
- business test data

when appropriate.

# 9. Tasks

Tasks represent API business activities.

Examples:

- SearchFlights
- CreateReservation
- AddPassengers
- GetSeatMap
- SelectSeat

Tasks should describe business intent rather than HTTP implementation.

Bad:

PostAvailabilityRequest

Preferred:

SearchForAvailableFlights

# 10. Questions and response validation

Validate API responses using:

- Ensure
- LastResponse
- reusable Questions when appropriate

Validate:

- status code
- response body
- mandatory fields
- values
- headers when relevant
- business rules
- JSON schema when available

Do not limit API tests to status-code validation only.

# 11. Cucumber conventions

Follow the project's existing Gherkin conventions.

Support:

- Scenario Outline
- Examples
- DataTable
- parameterised scenarios

Keep Gherkin focused on business behaviour.

Do not include:

- endpoint URLs
- JSONPath implementation details
- tokens
- HTTP library code
- internal class names

# 12. Environment configuration

Environment-specific values must come from configuration.

Examples:

API_BASE_URL
API_USERNAME
API_PASSWORD

Never commit real secrets.

If an example configuration is needed, create only placeholders.

Example:

API_BASE_URL=https://api.example.com

Do not place real credentials in source control.

# 13. API discovery integration

If serenity-api-discovery produced an API inventory:

1. Review the discovery results.
2. Reuse the real discovered endpoint structure.
3. Identify dependencies between APIs.
4. Identify dynamic values passed between requests.
5. Do not invent endpoints that were not discovered or documented.
6. Do not persist tokens or cookies captured during discovery.

# 14. API dependency handling

When one API returns data required by another:

Response A
-> extract required business value
-> store it as runtime test context
-> use it in Request B

Avoid global mutable variables.

Prefer actor-scoped state or appropriate Serenity/JS mechanisms.

# 15. Authentication

Identify the authentication mechanism before implementing API tests.

Examples:

- Bearer token
- Basic authentication
- session cookie
- custom authentication header

Never hardcode authentication secrets.

Browser authentication state and API authentication state should not be
assumed to be shared automatically.

# 16. Reporting

Preserve Serenity/JS reporting.

API interactions should appear in Serenity reports.

Use the existing reporter configuration when possible.

Do not create a second reporting configuration unnecessarily.

# 17. Scripts

Create clear pnpm scripts when missing.

Suggested scripts:

test:api
test:api:smoke
test:api:regression

Do not modify working web test scripts unnecessarily.

# 18. Scaffold workflow

When this skill is executed:

1. Inspect the existing repository.
2. Inspect dependencies.
3. Inspect API discovery results if available.
4. Identify missing API dependencies.
5. Install only missing dependencies.
6. Create the minimum required API folder structure.
7. Configure CallAnApi.
8. Configure environment-based base URL.
9. Configure Cucumber for API Features if necessary.
10. Preserve existing Serenity reporting.
11. Create one minimal API example based on a real approved endpoint.
12. Run TypeScript validation.
13. Run the API example.
14. Fix configuration problems.
15. Report all files created or modified.

Do not create dozens of placeholder classes.

Do not implement the complete API suite during scaffolding.

The purpose of this skill is to establish a working foundation.

# 19. Completion criteria

The scaffold is complete only when:

- TypeScript compiles
- Cucumber recognises the API Feature
- the actor can use CallAnApi
- at least one approved API request can execute
- response validation works
- Serenity reporting works
- existing web automation is not broken

Do not claim success without executing the relevant commands.
