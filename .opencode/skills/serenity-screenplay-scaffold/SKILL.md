---
name: serenity-screenplay-scaffold
description: Creates and maintains a QA automation framework using Serenity/JS, Screenplay Pattern, Cucumber, Playwright, TypeScript and pnpm.
---

# Serenity/JS Screenplay Framework

Use this skill when creating or restructuring the automation framework.

## Required stack

- TypeScript
- pnpm
- Playwright
- Cucumber
- Serenity/JS
- Screenplay Pattern
- Playwright MCP

## Architecture

Use:

features/
├── step-definitions/
├── support/
└── *.feature

src/
└── screenplay/
    ├── abilities/
    ├── interactions/
    ├── questions/
    ├── tasks/
    └── ui/

## Rules

Step Definitions must only connect Cucumber with Screenplay.

Do not put:
- selectors
- page.locator()
- page.click()
- business logic
- waitForTimeout()

inside Step Definitions.

Tasks represent business activities.

Questions retrieve application state.

UI modules contain selectors.

Use Screenplay flow:

Feature
-> Step Definition
-> Actor
-> Task
-> Interaction
-> UI

For validations use:

Feature
-> Step Definition
-> Actor
-> Ensure
-> Question

Use Playwright MCP only to explore the application and discover behaviour and locators.

Translate anything discovered by MCP into Screenplay abstractions.

Use pnpm exclusively.

Do not use npm, npx or yarn.

Use the locally installed Google Chrome when browser configuration is required.