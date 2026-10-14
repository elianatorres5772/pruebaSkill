import { setWorldConstructor } from '@cucumber/cucumber';
import { Actor, Cast, configure, Duration } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import * as path from 'node:path';
import { API_BASE_URL, API_DEFAULT_HEADERS } from '../../../src/api/config/api-environment.js';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: API_DEFAULT_HEADERS,
});

class ApiActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(CallAnApi.using(axiosInstance));
    }
}

class ApiWorld {
    actor: Actor;

    constructor(actor: Actor) {
        this.actor = actor;
    }
}

setWorldConstructor(ApiWorld);

configure({
    actors: new ApiActors(),
    crew: [
        ['@serenity-js/console-reporter', { theme: 'auto' }],
        [
            '@serenity-js/html-reporter',
            {
                outputDirectory: path.resolve(process.cwd(), 'reports/serenity-js-api'),
                specDirectory: path.resolve(process.cwd(), 'features/api'),
            },
        ],
        // Serenity BDD: JSON results that 'pnpm report:bdd:api' turns into the Serenity BDD HTML report.
        ['@serenity-js/serenity-bdd', { specDirectory: path.resolve(process.cwd(), 'features/api') }],
        ['@serenity-js/core:ArtifactArchiver', { outputDirectory: path.resolve(process.cwd(), 'target/site/serenity-api') }],
    ],
    cueTimeout: Duration.ofSeconds(10),
});
