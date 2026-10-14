import * as path from 'node:path';

export const TEST_BASE_URL = process.env.BASE_URL ?? 'https://playwright.dev/';

export const ARAJET_BASE_URL = process.env.ARAJET_BASE_URL ?? 'https://www.arajet.com/es-us/home';

export const BROWSER_CHANNEL = 'chrome' as const;

// Arajet's Cloudflare Turnstile only lets a real, persistent Chrome profile
// through, so the Serenity suite runs headed by default. Set HEADLESS=true
// to run without a window (the Arajet passenger-save step is then blocked by
// Cloudflare with a 403). See docs/arajet-cloudflare.md.
export const HEADLESS = process.env.HEADLESS === 'true';

// Persistent profile directory, so the Cloudflare clearance cookie survives runs.
export const BROWSER_USER_DATA_DIR =
    process.env.BROWSER_USER_DATA_DIR ??
    path.resolve(process.cwd(), '.arajet-browser-profile');

export const DEFAULT_NAVIGATION_TIMEOUT = 30_000;

export const DEFAULT_ACTION_TIMEOUT = 15_000;
