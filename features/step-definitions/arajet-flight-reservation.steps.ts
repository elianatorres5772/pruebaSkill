import { Given, Then, When } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import { containItemsWhereEachItem, Ensure, equals, includes, isTrue, matches, not, property } from '@serenity-js/assertions';
import { notes } from '@serenity-js/core';
import type { Actor } from '@serenity-js/core';

import { BookingExtraAdded, PassengerExtraQuantities } from '../../src/screenplay/questions/ArajetExtras.js';
import { OutboundFlightResults, PassengerInformationStep } from '../../src/screenplay/questions/ArajetFlightResults.js';
import { AssignedSeats, SeatSummary } from '../../src/screenplay/questions/ArajetSeatMap.js';
import { BookedPassengers, PassengerSubmitButtonState } from '../../src/screenplay/questions/ArajetPassengers.js';
import { AddExtras } from '../../src/screenplay/tasks/AddExtras.js';
import { ContinueToSeatSelection } from '../../src/screenplay/tasks/ContinueToSeatSelection.js';
import { buildArajetBookingData } from '../../src/screenplay/test-data/ArajetBookingData.js';
import type { ArajetBookingParameters } from '../../src/screenplay/test-data/ArajetBookingData.js';
import { buildArajetExtras } from '../../src/screenplay/test-data/ArajetExtrasData.js';
import type { ArajetExtraSelection } from '../../src/screenplay/test-data/ArajetExtrasData.js';
import { syntheticPassengers } from '../../src/screenplay/test-data/ArajetPassengerData.js';
import { EnterPassengerInformation } from '../../src/screenplay/tasks/EnterPassengerInformation.js';
import { OpenArajet } from '../../src/screenplay/tasks/OpenArajet.js';
import { SearchForFlight } from '../../src/screenplay/tasks/SearchForFlight.js';
import { SelectOutboundFlight, SelectReturnFlight } from '../../src/screenplay/tasks/SelectFlight.js';
import { SelectSeats } from '../../src/screenplay/tasks/SelectSeats.js';

interface BookingNotes {
    extras: ArajetExtraSelection[];
}

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
        children: values.children,
        infants: values.infants,
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
        Ensure.that(OutboundFlightResults(), matches(/^selecciona vuelo de salida$/i)),
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

When(
    '{pronoun} enters the details for {int} adults, {int} children and {int} infants',
    async (actor: Actor, adults: number, children: number, infants: number) => {
        await actor.attemptsTo(
            EnterPassengerInformation.forAll(syntheticPassengers({ adults, children, infants })),
        );
    },
);

Then(
    '{pronoun} should have {int} adults, {int} children and {int} infants ready to continue',
    async (actor: Actor, adults: number, children: number, infants: number) => {
        await actor.attemptsTo(
            Ensure.that(BookedPassengers('adult'), equals(String(adults))),
            Ensure.that(BookedPassengers('child'), equals(String(children))),
            Ensure.that(BookedPassengers('infant'), equals(String(infants))),
            Ensure.that(PassengerSubmitButtonState(), not(includes('button--disabled'))),
        );
    },
);

When('{pronoun} continues to the seats and extras step', async (actor: Actor) => {
    await actor.attemptsTo(ContinueToSeatSelection.fromPassengerStep());
});

When('{pronoun} skips the seat selection', async (actor: Actor) => {
    await actor.attemptsTo(SelectSeats.later());
});

When('{pronoun} selects random available seats', async (actor: Actor) => {
    await actor.attemptsTo(SelectSeats.randomly());
});

// Infants travel on the lap of an adult, so only adults and children get a seat
Then(
    '{pronoun} should have a seat on both flights for {int} adults and {int} children',
    async (actor: Actor, adults: number, children: number) => {
        const flights = 2;

        await actor.attemptsTo(
            Ensure.that(AssignedSeats(), property('length', equals((adults + children) * flights))),
            Ensure.that(AssignedSeats(), containItemsWhereEachItem(matches(/^\d+[A-Z]$/))),
            Ensure.that(SeatSummary(), not(includes('--'))),
        );
    },
);

When('{pronoun} adds the extras {string}', async (actor: Actor, extrasList: string) => {
    const extras = buildArajetExtras(extrasList);

    await actor.attemptsTo(
        notes<BookingNotes>().set('extras', extras),
        AddExtras.toBooking(extras),
    );
});

Then('{pronoun} should see every chosen extra added', async (actor: Actor) => {
    const extras = await actor.answer(notes<BookingNotes>().get('extras'));

    await actor.attemptsTo(
        ...extras.map(extra =>
            extra.scope === 'booking'
                ? Ensure.that(BookingExtraAdded(extra.extra), isTrue())
                : Ensure.that(
                    PassengerExtraQuantities(extra),
                    containItemsWhereEachItem(equals(extra.quantity)),
                ),
        ),
    );
});