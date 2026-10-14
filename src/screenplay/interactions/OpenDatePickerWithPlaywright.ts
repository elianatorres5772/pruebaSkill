import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

// After the destination is picked, Arajet opens the calendar by itself and
// keeps the date input disabled while it loads availability. We only click the
// input when the calendar did not open on its own.
export const OpenDatePickerWithPlaywright = (
    datePicker: Answerable<PageElement>,
    firstDate: Answerable<PageElement>,
) =>
    Interaction.where('#actor opens the travel date selector', async actor => {
        const input: Locator = await (await actor.answer(datePicker)).locator.nativeElement();
        const date: Locator = await (await actor.answer(firstDate)).locator.nativeElement();
        const deadline = Date.now() + 15_000;

        while (Date.now() < deadline) {
            if (await date.isVisible()) {
                return;
            }

            const isOpen = (await input.getAttribute('aria-expanded')) === 'true';

            if (!isOpen && await input.isEnabled()) {
                await input.click({ timeout: 2_000 }).catch(() => undefined);
            }

            await date.waitFor({ state: 'visible', timeout: 500 }).catch(() => undefined);
        }

        const state = await input.evaluate(element => ({
            disabled: (element as HTMLInputElement).disabled,
            expanded: element.getAttribute('aria-expanded'),
            dialogs: document.querySelectorAll('[role="dialog"]').length,
            origin: document.querySelector('.routes__container--origin')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
            destination: document.querySelector('.routes__container--destination')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
            dates: Array.from(document.querySelectorAll('span[data-date]')).slice(0, 3).map(span => span.getAttribute('data-date')),
        }));

        throw new Error(`The travel date selector did not show the expected date. State: ${ JSON.stringify(state) }`);
    });
