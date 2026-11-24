import { existsSync } from 'node:fs';
import * as path from 'node:path';

// Local settings and secrets (e.g. ARAJET_SECRET) live in .env, which is not committed
const envFile = path.resolve(process.cwd(), '.env');

if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

export const TEST_BASE_URL = process.env.BASE_URL ?? 'https://playwright.dev/';

export const ARAJET_BASE_URL = process.env.ARAJET_BASE_URL ?? 'https://www.arajet.com/es-us/home';

// Test environments (e.g. UAT) only let in requests that carry this header
export const ARAJET_SECRET_HEADER = process.env.ARAJET_SECRET_HEADER ?? 'x-secret';

export const ARAJET_SECRET = process.env.ARAJET_SECRET;

// Every confirmed booking is added to this file, outside target/ so it survives each run
// The outbound flight must leave within these hours from now, so the booking can be checked in
// (check-in opens 24 hours before departure) while there is still time to book and check in
export const MIN_HOURS_BEFORE_DEPARTURE = Number(process.env.MIN_HOURS_BEFORE_DEPARTURE ?? '4');

export const MAX_HOURS_BEFORE_DEPARTURE = Number(process.env.MAX_HOURS_BEFORE_DEPARTURE ?? '24');

export const BOOKINGS_FILE = path.resolve(process.cwd(), process.env.BOOKINGS_FILE ?? 'bookings/arajet-bookings.json');

// The bookings file starts empty on each run, so it only lists the bookings of the last one.
// CLEAN_BOOKINGS_FILE=false keeps adding to it instead.
export const CLEAN_BOOKINGS_FILE = process.env.CLEAN_BOOKINGS_FILE !== 'false';

export const BROWSER_CHANNEL = 'chrome' as const;

export const HEADLESS = process.env.HEADLESS === 'true';

export const BROWSER_USER_DATA_DIR =
    process.env.BROWSER_USER_DATA_DIR ??
    path.resolve(process.cwd(), '.arajet-browser-profile');

// The parallel runner cleans the report once, so its shards must not wipe each other's results
export const CLEAN_REPORT_DIRECTORY = process.env.CLEAN_REPORT_DIRECTORY !== 'false';

export const DEFAULT_NAVIGATION_TIMEOUT = 30_000;

export const DEFAULT_ACTION_TIMEOUT = 15_000;

export const FAKER_SEED = process.env.FAKER_SEED
    ? Number(process.env.FAKER_SEED)
    : undefined;
