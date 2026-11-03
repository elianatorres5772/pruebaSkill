import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

import type { ArajetBookingExtra, ArajetPassengerExtraSelection } from '../test-data/ArajetExtrasData.js';
import { ArajetExtrasUI } from '../ui/ArajetExtrasUI.js';

const extraUpdateTimeout = 10_000;

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> => {
    const pageElement = await actor.answer(element);

    return pageElement.locator.nativeElement();
};

const waitUntil = async (condition: () => Promise<boolean>, error: string): Promise<void> => {
    const deadline = Date.now() + extraUpdateTimeout;

    while (Date.now() < deadline) {
        if (await condition()) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error(error);
};

// 0 when the extra is not added, 1 when it is, or the stepper value for countable extras
export const extraQuantity = async (row: Locator): Promise<number> => {
    const stepper = row.locator(ArajetExtrasUI.stepperValue);

    if (await stepper.count() > 0) {
        return Number((await stepper.innerText()).trim());
    }

    return await row.locator(ArajetExtrasUI.addedButton).count() > 0 ? 1 : 0;
};

export const passengerExtraRows = async (
    actor: AnswersQuestions,
    { extra, passenger, flight }: ArajetPassengerExtraSelection,
): Promise<Locator[]> => {
    const rows = await actor.answer(ArajetExtrasUI.passengerExtras(extra, passenger, flight));

    return Promise.all(rows.map(row => row.locator.nativeElement()));
};

export const isBookingExtraAdded = async (actor: AnswersQuestions, extra: ArajetBookingExtra): Promise<boolean> => {
    const body = await nativeLocatorOf(actor, ArajetExtrasUI.bookingExtraBody(extra));

    return (await body.getAttribute('class') ?? '').includes('--added');
};

const addToRow = async (row: Locator, { extra, quantity }: ArajetPassengerExtraSelection): Promise<void> => {
    let current = await extraQuantity(row);

    if (current > quantity) {
        throw new Error(`${ extra } already has ${ current } item(s), more than the ${ quantity } requested`);
    }

    while (current < quantity) {
        const previous = current;
        const increment = row.locator(ArajetExtrasUI.stepperIncrement);

        if (current === 0 && await row.locator(ArajetExtrasUI.addButton).count() > 0) {
            await row.locator(ArajetExtrasUI.addButton).click();
        }
        else if (await increment.count() > 0) {
            await increment.click();
        }
        else {
            throw new Error(`${ extra } can only be added once per passenger and flight, but ${ quantity } were requested`);
        }

        await waitUntil(
            async () => await extraQuantity(row) > previous,
            `${ extra } was not added after clicking it`,
        );

        current = await extraQuantity(row);
    }
};

export const AddPassengerExtraWithPlaywright = (selection: ArajetPassengerExtraSelection) =>
    Interaction.where(
        `#actor adds ${ selection.quantity } ${ selection.extra } for ${
            selection.passenger === 'all' ? 'every passenger' : `passenger ${ selection.passenger }`
        } on ${ selection.flight === 'both' ? 'both flights' : `the ${ selection.flight } flight` }`,
        async actor => {
            const rows = await passengerExtraRows(actor, selection);

            if (rows.length === 0) {
                throw new Error(
                    `${ selection.extra } is not offered for passenger ${ selection.passenger } on ${ selection.flight } flight(s)`,
                );
            }

            for (const row of rows) {
                await addToRow(row, selection);
            }
        },
    );

export const SelectBookingExtraWithPlaywright = (extra: ArajetBookingExtra) =>
    Interaction.where(`#actor selects the ${ extra } extra`, async actor => {
        if (await isBookingExtraAdded(actor, extra)) {
            return;
        }

        const button = await nativeLocatorOf(actor, ArajetExtrasUI.bookingExtraButton(extra));
        await button.click();

        await waitUntil(
            () => isBookingExtraAdded(actor, extra),
            `${ extra } was not added after selecting it`,
        );
    });
