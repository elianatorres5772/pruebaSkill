import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

import { waitForNoLoadingOverlay } from '../../interactions/ClickWithPlaywright.js';
import type { ArajetBundle } from '../test-data/ArajetBookingData.js';
import { ArajetFlightResultsUI } from '../ui/ArajetFlightResultsUI.js';

// The flight search shows a "Por favor, espere" window that can stay up for a while on UAT
const flightsTimeout = 60_000;

// The outbound fares may open on their own once the results render, and clicking the toggle then would close them
const faresAutoOpenGrace = 2_000;

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> =>
    (await actor.answer(element)).locator.nativeElement();

const isVisible = (locator: Locator): Promise<boolean> =>
    locator.isVisible().catch(() => false);

const waitForAnyOf = async (locators: Locator[], timeout: number): Promise<Locator | undefined> => {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        for (const locator of locators) {
            if (await isVisible(locator)) {
                return locator;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return undefined;
};

// The flight list can re-render while it loads and fold the fares again, so open and pick them until it works
export const SelectFareWithPlaywright = (bundle: ArajetBundle, flightNumber = 1) =>
    Interaction.where(`#actor selects the ${ bundle } fare of flight ${ flightNumber } in the list`, async actor => {
        const fare = await nativeLocatorOf(actor, ArajetFlightResultsUI.fareSelectionButton(bundle));
        const toggle = await nativeLocatorOf(actor, ArajetFlightResultsUI.flightFaresToggle(flightNumber));
        let lastError: unknown;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            if (!await waitForAnyOf([fare, toggle], flightsTimeout)) {
                throw new Error(`Neither the ${ bundle } fare nor the fares of flight ${ flightNumber } were shown after ${ flightsTimeout / 1000 }s`);
            }

            await waitForNoLoadingOverlay(fare.page());

            try {
                // Only the first flight opens its fares on its own; any other flight is opened with its toggle
                if (flightNumber > 1 || !await waitForAnyOf([fare], faresAutoOpenGrace)) {
                    await toggle.click({ timeout: 10_000 });
                    await fare.waitFor({ state: 'visible', timeout: 10_000 });
                }

                await fare.click({ timeout: 10_000 });

                return;
            }
            catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    });

// Otherwise the outbound fare, still on screen for a moment, could be picked again as the return one
export const WaitForReturnFlightsWithPlaywright = () =>
    Interaction.where(`#actor waits for the return flights`, async actor => {
        const outboundHeading = await nativeLocatorOf(actor, ArajetFlightResultsUI.outboundHeading());
        await outboundHeading.waitFor({ state: 'hidden', timeout: flightsTimeout });
    });

export const ContinuePastFlightSummaryWithPlaywright = () =>
    Interaction.where(`#actor continues past the flight summary, if shown`, async actor => {
        const summaryContinue = await nativeLocatorOf(actor, ArajetFlightResultsUI.flightSummaryContinueButton());
        const passengerHeading = await nativeLocatorOf(actor, ArajetFlightResultsUI.passengerHeading());

        // The passenger page has its own "Continuar" button, so check for it first
        if (await waitForAnyOf([passengerHeading, summaryContinue], flightsTimeout) === summaryContinue) {
            await summaryContinue.click();
        }
    });
