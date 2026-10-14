import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';

export const SelectOptionWithPlaywright = (
    trigger: Answerable<PageElement>,
    option: Answerable<PageElement>,
    description: string,
) =>
    Interaction.where(`#actor selects ${ description }`, async actor => {
        const triggerElement = await actor.answer(trigger);
        const triggerLocator = await triggerElement.locator.nativeElement();
        let lastError: unknown;

        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                await triggerLocator.click({ trial: true });
                await triggerLocator.click();

                const optionElement = await actor.answer(option);
                const optionLocator = await optionElement.locator.nativeElement();
                await optionLocator.waitFor({ state: 'visible', timeout: 5_000 });
                await optionLocator.click();

                return;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    });
