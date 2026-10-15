import * as path from 'node:path';

export const TEST_BASE_URL = process.env.BASE_URL ?? 'https://playwright.dev/';

export const ARAJET_BASE_URL = process.env.ARAJET_BASE_URL ?? 'https://www.arajet.com/es-us/home';

export const BROWSER_CHANNEL = 'chrome' as const;

export const HEADLESS = process.env.HEADLESS === 'true';

export const BROWSER_USER_DATA_DIR =
    process.env.BROWSER_USER_DATA_DIR ??
    path.resolve(process.cwd(), '.arajet-browser-profile');

export const DEFAULT_NAVIGATION_TIMEOUT = 30_000;

export const DEFAULT_ACTION_TIMEOUT = 15_000;

export const FAKER_SEED = process.env.FAKER_SEED
    ? Number(process.env.FAKER_SEED)
    : undefined;
