import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

// Arajet opens the destination list on its own right after an origin is picked
// and re-renders it while it loads the available routes. Clicking the trigger
// again would close the list, and a click that lands during the re-render is
// lost, so we only open the dropdown when the option is not on screen and we
// confirm that the field now shows the selected value.
export const SelectOptionWithPlaywright = (
    trigger: Answerable<PageElement>,
    option: Answerable<PageElement>,
    description: string,
    selection?: {
        field: Answerable<PageElement>;
        expectedText: string;
        // An element the page enables (or expands) only once the selection is accepted.
        acceptedWhenReady?: Answerable<PageElement>;
    },
) =>
    Interaction.where(`#actor selects ${ description }`, async actor => {
        const triggerElement = await actor.answer(trigger);
        const triggerLocator: Locator = await triggerElement.locator.nativeElement();
        const visibleOption = async (): Promise<Locator | undefined> => {
            const optionElement = await actor.answer(option).catch(() => undefined);
            const optionLocator: Locator | undefined = await optionElement?.locator.nativeElement();

            return optionLocator && await optionLocator.isVisible() ? optionLocator : undefined;
        };
        const isSelected = async (): Promise<boolean> => {
            if (!selection) {
                return true;
            }

            const fieldLocator: Locator = await (await actor.answer(selection.field)).locator.nativeElement();
            const readyLocator: Locator | undefined = selection.acceptedWhenReady
                ? await (await actor.answer(selection.acceptedWhenReady)).locator.nativeElement()
                : undefined;
            const isReady = async () =>
                !readyLocator
                || await readyLocator.isEnabled()
                || (await readyLocator.getAttribute('aria-expanded')) === 'true';
            const deadline = Date.now() + 5_000;

            while (Date.now() < deadline) {
                if ((await fieldLocator.innerText()).includes(selection.expectedText) && await isReady()) {
                    return true;
                }

                await fieldLocator.page().waitForTimeout(100);
            }

            return false;
        };
        let lastError: unknown = new Error(`Could not select ${ description }`);

        for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
                if (!(await visibleOption())) {
                    await triggerLocator.click({ timeout: 5_000 });
                }

                const optionElement = await actor.answer(option);
                const optionLocator: Locator = await optionElement.locator.nativeElement();
                await optionLocator.click({ timeout: 5_000 });

                if (await isSelected()) {
                    return;
                }
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError;
    });
