import { AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { configure, Duration } from '@serenity-js/core';
import * as playwright from 'playwright';
import { rmSync } from 'node:fs';
import * as path from 'node:path';

import {
    BROWSER_CHANNEL,
    HEADLESS,
    BROWSER_USER_DATA_DIR,
} from '../../src/config/environment.js';
import { AutomationActors } from '../../src/screenplay/abilities/AutomationActors.js';

const cucumberStepTimeout = Duration.ofSeconds(90);
const serenityCueTimeout = Duration.ofSeconds(10);
const serenityReportDirectory = path.resolve(process.cwd(), 'target/site/serenity');

let context: playwright.BrowserContext | undefined;

setDefaultTimeout(cucumberStepTimeout.inMilliseconds());

BeforeAll({ timeout: 60_000 }, async () => {
    rmSync(serenityReportDirectory, { recursive: true, force: true });

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
            ['@serenity-js/serenity-bdd', { specDirectory: path.resolve(process.cwd(), 'features') }],
            ['@serenity-js/core:ArtifactArchiver', { outputDirectory: serenityReportDirectory }],
        ],
        cueTimeout: serenityCueTimeout,
    });
});

AfterAll({ timeout: 30_000 }, async () => {
    await context?.close();
});
