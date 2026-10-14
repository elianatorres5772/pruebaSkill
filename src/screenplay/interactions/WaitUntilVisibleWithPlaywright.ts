import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

// Serenity's isVisible() also requires the element not to be covered by others,
// which Arajet's sticky booking header breaks. Playwright's own visibility check
// is enough to know the element has been rendered.
export const WaitUntilVisibleWithPlaywright = (
    element: Answerable<PageElement>,
    description: string,
    timeoutInMilliseconds: number,
) =>
    Interaction.where(`#actor waits until ${ description } is visible`, async actor => {
        const nativeElement: Locator = await (await actor.answer(element)).locator.nativeElement();

        await nativeElement.waitFor({ state: 'visible', timeout: timeoutInMilliseconds });
    });
