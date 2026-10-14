import { Given, When, Then } from '@cucumber/cucumber';
import { Ensure, equals } from '@serenity-js/assertions';
import { GetRequest, LastResponse, Send } from '@serenity-js/rest';
import { FlightEndpoints } from '../../../src/api/endpoints/FlightEndpoints.js';

Given('the API is available', async function () {
});

When('I request the available routes', async function () {
    await this.actor.attemptsTo(
        Send.a(GetRequest.to(FlightEndpoints.routes)),
    );
});

Then('I should receive a successful response', async function () {
    await this.actor.attemptsTo(
        Ensure.that(LastResponse.status(), equals(200)),
    );
});
