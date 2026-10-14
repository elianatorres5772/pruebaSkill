import { Given, Then, When } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { Ensure, equals, includes, not } from '@serenity-js/assertions';
import type { Actor } from '@serenity-js/core';

import { OutboundFlightResults, PassengerInformationStep } from '../../src/screenplay/questions/ArajetFlightResults.js';
import { BookedAdults, PassengerSubmitButtonState } from '../../src/screenplay/questions/ArajetPassengers.js';
import { buildArajetBookingData } from '../../src/screenplay/test-data/ArajetBookingData.js';
import type { ArajetBookingParameters } from '../../src/screenplay/test-data/ArajetBookingData.js';
import { syntheticPassengers } from '../../src/screenplay/test-data/ArajetPassengerData.js';
import { EnterPassengerInformation } from '../../src/screenplay/tasks/EnterPassengerInformation.js';
import { OpenArajet } from '../../src/screenplay/tasks/OpenArajet.js';
import { SearchForFlight } from '../../src/screenplay/tasks/SearchForFlight.js';
import { SelectOutboundFlight, SelectReturnFlight } from '../../src/screenplay/tasks/SelectFlight.js';

const bookingParametersFrom = (table: DataTable): ArajetBookingParameters => {
    const values = Object.fromEntries(
        table.raw()
            .slice(1)
            .map(([field, value]) => [field, value]),
    );

    return {
        origin: values.origin,
        destination: values.destination,
        outDay: values.outDay,
        arrivalDay: values.arrivalDay,
        bundle: values.bundle,
        adults: values.adults,
    };
};

Given('{actor} is on the Arajet home page', async (actor: Actor) => {
    await actor.attemptsTo(OpenArajet.homePage());
});

When('{actor} searches for a round trip using:', async (actor: Actor, table: DataTable) => {
    const booking = buildArajetBookingData(bookingParametersFrom(table));

    await actor.attemptsTo(SearchForFlight.onArajet(booking));
});

Then('{pronoun} should see available outbound flights', async (actor: Actor) => {
    await actor.attemptsTo(
        Ensure.that(OutboundFlightResults(), equals('Selecciona Vuelo De Salida')),
    );
});

When('{pronoun} selects the {string} bundle for the outbound flight', async (actor: Actor, bundle: string) => {
    await actor.attemptsTo(SelectOutboundFlight.withBundle(bundle as 'Basic' | 'Comfort' | 'Extra'));
});

When('{pronoun} selects the {string} bundle for the return flight', async (actor: Actor, bundle: string) => {
    await actor.attemptsTo(SelectReturnFlight.withBundle(bundle as 'Basic' | 'Comfort' | 'Extra'));
});

Then('{pronoun} should reach the passenger information step', async (actor: Actor) => {
    await actor.attemptsTo(
        Ensure.that(PassengerInformationStep(), includes('Pasajeros')),
    );
});

When('{pronoun} enters the details for {int} passengers', async (actor: Actor, adults: number) => {
    await actor.attemptsTo(EnterPassengerInformation.forAll(syntheticPassengers(adults)));
});

Then('{pronoun} should have all {int} passengers ready to continue', async (actor: Actor, adults: number) => {
    await actor.attemptsTo(
        Ensure.that(BookedAdults(), equals(String(adults))),
        Ensure.that(PassengerSubmitButtonState(), not(includes('button--disabled'))),
    );
});