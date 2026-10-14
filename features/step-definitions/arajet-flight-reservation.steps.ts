import { Given, Then, When } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { Ensure, equals, includes, not } from '@serenity-js/assertions';
import type { Actor } from '@serenity-js/core';

import { OutboundFlightResults, PassengerInformationStep } from '../../src/screenplay/questions/ArajetFlightResults.js';
import { SeatMap, SeatSummary } from '../../src/screenplay/questions/ArajetSeatMap.js';
import { buildArajetBookingData } from '../../src/screenplay/test-data/ArajetBookingData.js';
import type { ArajetBookingParameters } from '../../src/screenplay/test-data/ArajetBookingData.js';
import { syntheticPassenger } from '../../src/screenplay/test-data/ArajetPassengerData.js';
import { ContinueToSeatSelection } from '../../src/screenplay/tasks/ContinueToSeatSelection.js';
import { EnterPassengerInformation } from '../../src/screenplay/tasks/EnterPassengerInformation.js';
import { OpenArajet } from '../../src/screenplay/tasks/OpenArajet.js';
import { SearchForFlight } from '../../src/screenplay/tasks/SearchForFlight.js';
import { SelectSeats } from '../../src/screenplay/tasks/SelectSeats.js';
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

When('{pronoun} enters the passenger details', async (actor: Actor) => {
    await actor.attemptsTo(EnterPassengerInformation.with(syntheticPassenger()));
});

When('{pronoun} continues to seat selection', async (actor: Actor) => {
    await actor.attemptsTo(ContinueToSeatSelection.fromPassengerStep());
});

Then('{pronoun} should see the seat map', async (actor: Actor) => {
    await actor.attemptsTo(
        Ensure.that(SeatMap(), includes('Selección de asiento')),
    );
});

When('{pronoun} selects an available seat for each flight', async (actor: Actor) => {
    await actor.attemptsTo(SelectSeats.forEachFlight());
});

Then('{pronoun} should see seats assigned for both flights', async (actor: Actor) => {
    await actor.attemptsTo(
        Ensure.that(SeatSummary(), includes('MIA')),
        Ensure.that(SeatSummary(), includes('PUJ')),
        Ensure.that(SeatSummary(), not(includes('--'))),
    );
});
