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

// e.g. "available standard: 27, occupied preferred: 28, blocked exit: 12"
const seatMapSummary = async (actor: AnswersQuestions): Promise<string> => {
    const counts = new Map<string, number>();

    for (const seat of await nativeLocatorsOf(actor, ArajetSeatMapUI.allSeats())) {
        const key = `${ await seat.getAttribute('data-seat-state') } ${ await seat.getAttribute('data-seat-type') }`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return counts.size > 0
        ? [...counts].map(([key, count]) => `${ key }: ${ count }`).join(', ')
        : 'no seats shown';
};

// Seats are read for each passenger, as the ones already taken are no longer available.
// The seat map of the next flight loads after its header changes, so wait for its seats.
const availableSeatsOn = async (actor: AnswersQuestions, flight: number): Promise<Locator[]> => {
    let seats: Locator[] = [];

    try {
        await waitUntil(
            async () => (seats = await nativeLocatorsOf(actor, ArajetSeatMapUI.availableSeats())).length > 0,
            'no available seats',
        );
    }
    catch {
        throw new Error(
            `There are no available seats on flight ${ flight } after ${ seatMapTimeout / 1000 }s. Seat map: ${ await seatMapSummary(actor) }`,
        );
    }

    return seats;
};

const selectRandomSeatFor = async (actor: AnswersQuestions, passenger: Locator, flight: number): Promise<void> => {
    if (await passenger.getAttribute('aria-pressed') !== 'true') {
        await passenger.click();
    }

    const seat = faker.helpers.arrayElement(await availableSeatsOn(actor, flight));
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
