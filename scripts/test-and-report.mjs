// Runs a test script and then generates the Serenity BDD report, even when
// tests fail, so failures show up in the report. Exits with the tests' code.
//
// Usage: node scripts/test-and-report.mjs <test-script> <report-script> [open-script]
import { spawnSync } from 'node:child_process';

const [testScript, reportScript, openScript] = process.argv.slice(2);

if (!testScript || !reportScript) {
    console.error('Usage: node scripts/test-and-report.mjs <test-script> <report-script> [open-script]');
    process.exit(2);
}

const run = script => spawnSync(`pnpm ${ script }`, { stdio: 'inherit', shell: true }).status ?? 1;

const testsExitCode = run(testScript);
const reportExitCode = run(reportScript);

if (openScript && reportExitCode === 0) {
    run(openScript);
}

process.exit(testsExitCode !== 0 ? testsExitCode : reportExitCode);
