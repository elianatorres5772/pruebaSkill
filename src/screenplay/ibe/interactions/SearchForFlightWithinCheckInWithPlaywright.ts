import { Interaction, notes } from '@serenity-js/core';
import type { AnswersQuestions, PerformsActivities } from '@serenity-js/core';
import type { Locator, Page } from 'playwright';

import { OpenArajet } from '../../tasks/OpenArajet.js';
import { SearchForFlight } from '../tasks/SearchForFlight.js';
import type { ArajetBookingData } from '../test-data/ArajetBookingData.js';
import {
    candidateDates,
    departureInstant,
    departureWindow,
    describeWindow,
    isWithin,
} from '../test-data/ArajetDeparture.js';
import { ArajetFlightResultsUI } from '../ui/ArajetFlightResultsUI.js';

export interface OutboundFlightNotes {
    booking: ArajetBookingData;
    // Position of the chosen flight in the outbound list, starting at 1
    outboundFlightNumber: number;
}

const resultsTimeout = 60_000;

const departureTimesOn = async (page: Page): Promise<string[]> => {
    const cards = page.locator(ArajetFlightResultsUI.flightCards);

    if (!await cards.first().waitFor({ state: 'visible', timeout: resultsTimeout }).then(() => true, () => false)) {
        return [];
    }

    return (await cards.allInnerTexts())
        .map(text => /\d{1,2}:\d{2}\s*[ap]\.?\s*m\.?/i.exec(text)?.[0] ?? '');
};

const resultsPage = async (actor: AnswersQuestions): Promise<Page> => {
    const heading = await (await actor.answer(ArajetFlightResultsUI.outboundHeading())).locator.nativeElement() as Locator;
    await heading.waitFor({ state: 'visible', timeout: resultsTimeout });

    return heading.page();
};

// Check-in opens 24 hours before departure, so the outbound flight must leave within that time (and late
// enough to still book and check in). The flights of each possible date are searched in turn, and the first
// one leaving within that window is noted for the outbound flight selection.
export const SearchForFlightWithinCheckInWithPlaywright = (booking: ArajetBookingData) =>
    Interaction.where(
        `#actor searches for a round trip from ${ booking.origin } to ${ booking.destination } leaving within the check-in window`,
        async actorAnswering => {
            // The actor given to an interaction can also perform activities, though its type does not say so
            const actor = actorAnswering as typeof actorAnswering & PerformsActivities;
            const window = departureWindow(booking.origin);
            const found: string[] = [];

            for (const [index, date] of candidateDates(window).entries()) {
                const search = { ...booking, departureDate: date };

                try {
                    if (index > 0) {
                        await actor.attemptsTo(OpenArajet.homePage());
                    }

                    await actor.attemptsTo(SearchForFlight.onArajet(search));

                    const times = await departureTimesOn(await resultsPage(actor));
                    const flight = times.findIndex(time => time && isWithin(departureInstant(date, time, window.timeZone), window));

                    found.push(`${ date }: ${ times.filter(Boolean).join(', ') || 'no flights' }`);

                    if (flight >= 0) {
                        await actor.attemptsTo(
                            notes<OutboundFlightNotes>().set('booking', { ...search, departureTime: times[flight] }),
                            notes<OutboundFlightNotes>().set('outboundFlightNumber', flight + 1),
                        );

                        return;
                    }
                }
                catch (error) {
                    found.push(`${ date }: could not search (${ String(error).split('\n')[0] })`);
                }
            }

            throw new Error(
                `No flight from ${ booking.origin } to ${ booking.destination } leaves ${ describeWindow(window) }, `
                + `so the booking could not be checked in. Flights found: ${ found.join('; ') }`,
            );
        },
    );
