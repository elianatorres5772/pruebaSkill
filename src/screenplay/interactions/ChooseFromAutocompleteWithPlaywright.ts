import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

const optionTimeout = 10_000;

// Arajet's autocompletes only filter their options on key presses, so a pasted value (what
// Enter.theValue does) leaves the list unfiltered. Typing the whole name may also pick the
// option right away and close the list, so the choice is done once the field shows the value.
export const chooseFromAutocomplete = async (input: Locator, option: Locator, value: string, description: string): Promise<void> => {
    // Typing opens the options list and filters it. The field is focused, not clicked,
    // because on some of them the floating label covers the input.
    // Some autocompletes stay disabled until another field is chosen (the state waits for the country)
    const enabledBy = Date.now() + optionTimeout;

    while (!await input.isEnabled({ timeout: optionTimeout }) && Date.now() < enabledBy) {
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    await input.focus({ timeout: optionTimeout });
    await input.fill('');
    await input.pressSequentially(value, { delay: 80 });

    const deadline = Date.now() + optionTimeout;

    while (Date.now() < deadline) {
        // The list can still be re-rendering while it filters, so a failed click is tried again
        if (await option.isVisible().catch(() => false)
            && await option.click({ timeout: 2_000 }).then(() => true, () => false)) {
            return;
        }

        const isListOpen = (await input.getAttribute('aria-expanded')) === 'true';

        if (!isListOpen && (await input.inputValue()).trim() === value) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error(`Could not choose "${ value }" in ${ description }: the field shows "${ await input.inputValue() }"`);
};

export const ChooseFromAutocompleteWithPlaywright = (
    value: string,
    field: Answerable<PageElement>,
    option: Answerable<PageElement>,
    description: string,
) =>
    Interaction.where(`#actor chooses "${ value }" in ${ description }`, async actor => {
        const input = await (await actor.answer(field)).locator.nativeElement() as Locator;
        const choice = await (await actor.answer(option)).locator.nativeElement() as Locator;

        await chooseFromAutocomplete(input, choice, value, description);
    });
