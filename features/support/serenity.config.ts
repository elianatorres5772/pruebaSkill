import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { configure, Duration } from '@serenity-js/core';
import * as playwright from 'playwright';
import * as path from 'node:path';

import {
    BROWSER_CHANNEL,
    HEADLESS,
    BROWSER_USER_DATA_DIR,
} from '../../src/config/environment.js';
import { AutomationActors } from '../../src/screenplay/abilities/AutomationActors.js';

const cucumberStepTimeout = Duration.ofSeconds(90);
const serenityCueTimeout = Duration.ofSeconds(10);

let context: playwright.BrowserContext | undefined;

setDefaultTimeout(cucumberStepTimeout.inMilliseconds());

BeforeAll({ timeout: 60_000 }, async () => {
    // A persistent context is required: Arajet protects the passenger-save
    // endpoint with Cloudflare Turnstile, which only lets a real, persistent
    // Chrome profile through. See docs/arajet-cloudflare.md.
    context = await playwright.chromium.launchPersistentContext(
        BROWSER_USER_DATA_DIR,
        {
            channel: BROWSER_CHANNEL,
            headless: HEADLESS,
            args: ['--disable-blink-features=AutomationControlled'],
        },
    );

    const page = context.pages()[0] ?? (await context.newPage());

    configure({
        actors: new AutomationActors(page),
        crew: [
            ['@serenity-js/console-reporter', { theme: 'auto' }],
            ['@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' }],
            [
                '@serenity-js/html-reporter',
                {
                    outputDirectory: path.resolve(process.cwd(), 'reports/serenity-js'),
                    specDirectory: path.resolve(process.cwd(), 'features'),
                },
            ],
            // Serenity BDD: JSON results that 'pnpm report:bdd' turns into the Serenity BDD HTML report.
            ['@serenity-js/serenity-bdd', { specDirectory: path.resolve(process.cwd(), 'features') }],
            ['@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(process.cwd(), 'target/site/serenity') }],
        ],
        cueTimeout: serenityCueTimeout,
    });
});

AfterAll({ timeout: 30_000 }, async () => {
    await context?.close();
});
