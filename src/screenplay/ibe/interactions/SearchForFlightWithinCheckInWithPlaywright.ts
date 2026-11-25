import { Interaction, Log, notes } from '@serenity-js/core';
import type { Answerable, AnswersQuestions, PerformsActivities } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator, Page } from 'playwright';

import { OpenArajet } from '../../tasks/OpenArajet.js';
import { SearchForFlight } from '../tasks/SearchForFlight.js';
import type { ArajetBookingData } from '../test-data/ArajetBookingData.js';
import {
    departureInstant,
    departureWindow,
    describeWindow,
    isWithin,
    searchDates,
} from '../test-data/ArajetDeparture.js';
import { ArajetFlightResultsUI } from '../ui/ArajetFlightResultsUI.js';

export interface OutboundFlightNotes {
    booking: ArajetBookingData;
    // Position of the chosen flight in the outbound list, starting at 1
    outboundFlightNumber: number;
}

const resultsTimeout = 60_000;

interface FlightsShown {
    // Whether the list shows any flight at all
    any: boolean;
    // The departure time of each flight in the list, '' when it could not be read
    times: string[];
    // What the flights or the page said, for the report
    seen: string;
}

const firstWords = (text: string, length = 120) => text.replace(/\s+/g, ' ').trim().slice(0, length);

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> =>
    (await actor.answer(element)).locator.nativeElement();

const firstVisible = async (locators: Locator[], timeout: number): Promise<Locator | undefined> => {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        for (const locator of locators) {
            if (await locator.isVisible().catch(() => false)) {
                return locator;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }

    return undefined;
};

// The flight cards carry the departure times. Some browsers get a list without those cards; its first flight can
// still be told by its fares, so the flight is then picked without knowing its time.
const flightsShownOn = async (actor: AnswersQuestions, page: Page, booking: ArajetBookingData): Promise<FlightsShown> => {
    const cards = page.locator(ArajetFlightResultsUI.flightCards);
    const firstFlight = [
        await nativeLocatorOf(actor, ArajetFlightResultsUI.flightFaresToggle(1)),
        await nativeLocatorOf(actor, ArajetFlightResultsUI.fareSelectionButton(booking.bundle)),
    ];
    const shown = await firstVisible([cards.first(), ...firstFlight], resultsTimeout);

    if (!shown) {
        const body = await page.locator('body').innerText({ timeout: 5_000 }).catch(() => '');

        return { any: false, times: [], seen: `no flights after ${ resultsTimeout / 1000 }s, the page said: "${ firstWords(body, 200) }"` };
    }

    const texts = await cards.allInnerTexts();
    const times = texts.map(text => /\d{1,2}:\d{2}(?:\s*[ap]\.?\s*m\.?)?/i.exec(text)?.[0] ?? '');

    return {
        any: true,
        times,
        seen: times.filter(Boolean).join(', ') || 'flights shown, but their departure times could not be read',
    };
};

const resultsPage = async (actor: AnswersQuestions): Promise<Page> => {
    const heading = await nativeLocatorOf(actor, ArajetFlightResultsUI.outboundHeading());
    await heading.waitFor({ state: 'visible', timeout: resultsTimeout });

    return heading.page();
};

// The outbound flight always leaves from tomorrow on, never today. Check-in opens 24 hours before departure,
// so a flight of tomorrow leaving within that time (and late enough to still book and check in) is preferred.
// When none does, the flight leaving soonest is taken anyway, and the report says it cannot be checked in yet.
// Later dates are only searched when a date shows no flights at all.
export const SearchForFlightWithinCheckInWithPlaywright = (booking: ArajetBookingData) =>
    Interaction.where(
        `#actor searches for a round trip from ${ booking.origin } to ${ booking.destination } leaving from tomorrow on`,
        async actorAnswering => {
            // The actor given to an interaction can also perform activities, though its type does not say so
            const actor = actorAnswering as typeof actorAnswering & PerformsActivities;
            const window = departureWindow(booking.origin);
            const found: string[] = [];

            for (const [index, date] of searchDates(window).entries()) {
                const search = { ...booking, departureDate: date };

                try {
                    if (index > 0) {
                        await actor.attemptsTo(OpenArajet.homePage());
                    }

                    await actor.attemptsTo(SearchForFlight.onArajet(search));

                    const flights = await flightsShownOn(actor, await resultsPage(actor), booking);
                    found.push(`${ date }: ${ flights.seen }`);

                    if (!flights.any) {
                        continue;
                    }

                    const departures = flights.times.map(time => time ? departureInstant(date, time, window.timeZone) : undefined);
                    const withinCheckIn = departures.findIndex(instant => instant && isWithin(instant, window));
                    const soonest = departures.reduce<number>(
                        (best, instant, position) => instant && (best < 0 || instant < departures[best]!) ? position : best,
                        -1,
                    );
                    // Without any time to compare, the first flight of the list is the soonest one
                    const flight = withinCheckIn >= 0 ? withinCheckIn : Math.max(soonest, 0);

                    if (withinCheckIn < 0) {
                        await actor.attemptsTo(Log.the(
                            `No flight on ${ date } leaves ${ describeWindow(window) }, so flight ${ flight + 1 } `
                            + `(${ flights.times[flight] || 'time unknown' }) is booked, and it cannot be checked in yet`,
                        ));
                    }

                    await actor.attemptsTo(
                        notes<OutboundFlightNotes>().set('booking', { ...search, departureTime: flights.times[flight] || undefined }),
                        notes<OutboundFlightNotes>().set('outboundFlightNumber', flight + 1),
                    );

                    return;
                }
                catch (error) {
                    found.push(`${ date }: could not search (${ String(error).split('\n')[0] })`);
                }
            }

            throw new Error(
                `No flight from ${ booking.origin } to ${ booking.destination } was found from tomorrow on. `
                + `Searched: ${ found.join('; ') }`,
            );
        },
    );
