import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

import type { ArajetPassengerType } from '../test-data/ArajetPassengerData.js';
import { ArajetFlightSearchUI } from '../ui/ArajetFlightSearchUI.js';

export type PassengerCounts = Record<ArajetPassengerType, number>;

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> => {
    const pageElement = await actor.answer(element);

    return pageElement.locator.nativeElement();
};

const selectCount = async (actor: AnswersQuestions, type: ArajetPassengerType, expected: number): Promise<void> => {
    const count = await nativeLocatorOf(actor, ArajetFlightSearchUI.passengerCount(type));
    const increase = await nativeLocatorOf(actor, ArajetFlightSearchUI.increasePassengersButton(type));

    for (let current = Number((await count.innerText()).trim()); current < expected; current += 1) {
        await increase.click();
    }

    const selected = Number((await count.innerText()).trim());

    if (selected !== expected) {
        throw new Error(`Expected ${ expected } ${ type } passenger(s), but the selector shows ${ selected }`);
    }
};

export const SelectPassengersWithPlaywright = ({ adult, child, infant }: PassengerCounts) =>
    Interaction.where(
        `#actor selects ${ adult } adult(s), ${ child } child(ren) and ${ infant } infant(s)`,
        async actor => {
            const dropdown = await nativeLocatorOf(actor, ArajetFlightSearchUI.passengersDropdown());
            const panel = await nativeLocatorOf(actor, ArajetFlightSearchUI.passengersPanel());

            if (!(await panel.isVisible())) {
                await dropdown.click();
                await panel.waitFor({ state: 'visible', timeout: 5_000 });
            }

            // Adults first: the selector caps infants at the number of adults
            await selectCount(actor, 'adult', adult);
            await selectCount(actor, 'child', child);
            await selectCount(actor, 'infant', infant);

            await dropdown.click();
            await panel
                .waitFor({ state: 'hidden', timeout: 3_000 })
                .catch(() => dropdown.page().keyboard.press('Escape'));
        },
    );
