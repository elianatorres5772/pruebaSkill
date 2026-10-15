import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

const reportDirectory = process.argv[2] ?? 'target/site/serenity';
const report = path.resolve(reportDirectory, 'index.html');

if (!existsSync(report)) {
    console.error(`No Serenity BDD report found at ${ report }. Run the tests first.`);
    process.exit(1);
}

const [command, args] =
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', report]] :
    process.platform === 'darwin' ? ['open', [report]] :
    ['xdg-open', [report]];

spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
console.log(`Opened ${ report }`);
