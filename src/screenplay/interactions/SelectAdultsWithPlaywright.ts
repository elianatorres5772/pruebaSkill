import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

import { ArajetFlightSearchUI } from '../ui/ArajetFlightSearchUI.js';

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> => {
    const pageElement = await actor.answer(element);

    return pageElement.locator.nativeElement();
};

// The passengers dropdown starts at 1 adult; we click "+" until the stepper
// shows the requested number and then close the dropdown again.
export const SelectAdultsWithPlaywright = (adults: number) =>
    Interaction.where(`#actor selects ${ adults } adult passenger(s)`, async actor => {
        const dropdown = await nativeLocatorOf(actor, ArajetFlightSearchUI.passengersDropdown());
        const panel = await nativeLocatorOf(actor, ArajetFlightSearchUI.passengersPanel());
        const count = await nativeLocatorOf(actor, ArajetFlightSearchUI.adultsCount());
        const increase = await nativeLocatorOf(actor, ArajetFlightSearchUI.increaseAdultsButton());

        if (!(await panel.isVisible())) {
            await dropdown.click();
            await panel.waitFor({ state: 'visible', timeout: 5_000 });
        }

        for (let current = Number((await count.innerText()).trim()); current < adults; current += 1) {
            await increase.click();
        }

        const selected = Number((await count.innerText()).trim());

        if (selected !== adults) {
            throw new Error(`Expected ${ adults } adult passenger(s), but the selector shows ${ selected }`);
        }

        await dropdown.click();
        await panel
            .waitFor({ state: 'hidden', timeout: 3_000 })
            .catch(() => dropdown.page().keyboard.press('Escape'));
    });
