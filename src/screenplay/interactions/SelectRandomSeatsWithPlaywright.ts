import { faker } from '@faker-js/faker';
import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement, PageElements } from '@serenity-js/web';
import type { Locator } from 'playwright';

import { ArajetSeatMapUI } from '../ui/ArajetSeatMapUI.js';

const seatMapTimeout = 30_000;

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> => {
    const pageElement = await actor.answer(element);

    return pageElement.locator.nativeElement();
};

const nativeLocatorsOf = async (actor: AnswersQuestions, elements: PageElements): Promise<Locator[]> => {
    const pageElements = await actor.answer(elements);

    return Promise.all(pageElements.map(element => element.locator.nativeElement()));
};

const waitUntil = async (condition: () => Promise<boolean>, error: string): Promise<void> => {
    const deadline = Date.now() + seatMapTimeout;

    while (Date.now() < deadline) {
        if (await condition()) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error(error);
};

// "Vuelo 1/2" -> { current: 1, total: 2 }
const flightProgress = async (actor: AnswersQuestions): Promise<{ current: number; total: number }> => {
    const progress = await nativeLocatorOf(actor, ArajetSeatMapUI.flightProgress());
    await progress.waitFor({ state: 'visible', timeout: seatMapTimeout });
    const [, current, total] = /(\d+)\s*\/\s*(\d+)/.exec(await progress.innerText()) ?? [];

    if (!current || !total) {
        throw new Error(`Could not read the seat map flight progress: ${ await progress.innerText() }`);
    }

    return { current: Number(current), total: Number(total) };
};

const seatCodeOf = async (seat: Locator): Promise<string> =>
    /Asiento (\w+)/.exec(await seat.getAttribute('aria-label') ?? '')?.[1] ?? '';

const currentFlightSeatOf = async (passenger: Locator): Promise<string> => {
    const badge = passenger.locator(ArajetSeatMapUI.currentFlightSeat);

    return await badge.count() > 0 ? (await badge.innerText()).trim() : '';
};

const selectRandomSeatFor = async (actor: AnswersQuestions, passenger: Locator, flight: number): Promise<void> => {
    if (await passenger.getAttribute('aria-pressed') !== 'true') {
        await passenger.click();
    }

    // Seats are read for each passenger, as the ones already taken are no longer available
    const seats = await nativeLocatorsOf(actor, ArajetSeatMapUI.availableSeats());

    if (seats.length === 0) {
        throw new Error(`There are no available seats left on flight ${ flight }`);
    }

    const seat = faker.helpers.arrayElement(seats);
    const seatCode = await seatCodeOf(seat);
    await seat.click();

    await waitUntil(
        async () => await currentFlightSeatOf(passenger) === seatCode,
        `Seat ${ seatCode } was not assigned to ${ await passenger.getAttribute('aria-label') } on flight ${ flight }`,
    );
};

export const SelectRandomSeatsWithPlaywright = () =>
    Interaction.where('#actor selects a random available seat for every passenger on every flight', async actor => {
        const { total } = await flightProgress(actor);

        for (let flight = 1; flight <= total; flight += 1) {
            await waitUntil(
                async () => (await flightProgress(actor)).current === flight,
                `The seat map did not show flight ${ flight } of ${ total }`,
            );

            for (const passenger of await nativeLocatorsOf(actor, ArajetSeatMapUI.passengerRows())) {
                await selectRandomSeatFor(actor, passenger, flight);
            }

            const button = await nativeLocatorOf(
                actor,
                flight < total ? ArajetSeatMapUI.nextFlightButton() : ArajetSeatMapUI.saveSeatsButton(),
            );
            await button.click();
        }

        const heading = await nativeLocatorOf(actor, ArajetSeatMapUI.heading());
        await heading.waitFor({ state: 'hidden', timeout: seatMapTimeout });
    });
