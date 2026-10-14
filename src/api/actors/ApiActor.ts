import type { Actor, Cast } from '@serenity-js/core';
import { CallAnApi } from '@serenity-js/rest';
import axios from 'axios';
import { API_BASE_URL, API_DEFAULT_HEADERS } from '../config/api-environment.js';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: API_DEFAULT_HEADERS,
});

export class ApiActors implements Cast {
    prepare(actor: Actor): Actor {
        return actor.whoCan(CallAnApi.using(axiosInstance));
    }
}
