// Runs the Cucumber suite split into shards, each one in its own process and Chrome profile.
// Usage: node scripts/run-parallel.mjs [cucumber-js options], e.g. --tags @smoke
// PARALLEL sets the number of shards (default 2).
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

const shards = Number(process.env.PARALLEL ?? '2');

if (!Number.isInteger(shards) || shards < 1) {
    console.error(`PARALLEL must be a whole number greater than 0, but got: ${ process.env.PARALLEL }`);
    process.exit(2);
}

const cucumberArguments = process.argv.slice(2);
const baseProfile = process.env.BROWSER_USER_DATA_DIR ?? path.resolve(process.cwd(), '.arajet-browser-profile');
const reportDirectory = path.resolve(process.cwd(), 'target/site/serenity');
const bookingsFile = path.resolve(process.cwd(), process.env.BOOKINGS_FILE ?? 'bookings/arajet-bookings.json');

// Chrome cannot open one profile from two processes. Each shard gets its own copy of the base
// profile so it keeps the Cloudflare clearance already stored there.
const profileFor = shard => {
    const profile = `${ baseProfile }-shard-${ shard }`;

    if (!existsSync(profile) && existsSync(baseProfile)) {
        cpSync(baseProfile, profile, {
            recursive: true,
            filter: source => !path.basename(source).startsWith('Singleton'),
        });
    }

    return profile;
};

const prefixed = (stream, prefix) => {
    let pending = '';

    return chunk => {
        const lines = (pending + chunk).split(/\r?\n/);
        pending = lines.pop();
        lines.forEach(line => stream.write(`${ prefix } ${ line }\n`));
    };
};

const runShard = shard =>
    new Promise(resolve => {
        const prefix = `[shard ${ shard }/${ shards }]`;
        const child = spawn(
            'pnpm',
            ['exec', 'cucumber-js', '--shard', `${ shard }/${ shards }`, ...cucumberArguments],
            {
                shell: true,
                env: {
                    ...process.env,
                    BROWSER_USER_DATA_DIR: profileFor(shard),
                    CLEAN_REPORT_DIRECTORY: 'false',
                    CLEAN_BOOKINGS_FILE: 'false',
                },
            },
        );

        child.stdout.on('data', prefixed(process.stdout, prefix));
        child.stderr.on('data', prefixed(process.stderr, prefix));
        child.on('close', code => resolve(code ?? 1));
    });

rmSync(reportDirectory, { recursive: true, force: true });

// Emptied once here: every shard adds its bookings to the same file
if (process.env.CLEAN_BOOKINGS_FILE !== 'false') {
    mkdirSync(path.dirname(bookingsFile), { recursive: true });
    writeFileSync(bookingsFile, '[]\n');
}

const exitCodes = await Promise.all(
    Array.from({ length: shards }, (_, index) => runShard(index + 1)),
);

exitCodes.forEach((code, index) =>
    console.log(`[shard ${ index + 1 }/${ shards }] ${ code === 0 ? 'passed' : `failed with exit code ${ code }` }`),
);

process.exit(exitCodes.find(code => code !== 0) ?? 0);
