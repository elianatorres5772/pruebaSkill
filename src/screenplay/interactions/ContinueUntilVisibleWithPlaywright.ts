import { Interaction } from '@serenity-js/core';
import type { Answerable, AnswersQuestions } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

import { waitForNoLoadingOverlay } from './ClickWithPlaywright.js';

// Time for a click to take effect (a new tab, page or pop-up) before anything else is clicked
const settleTime = 5_000;

// A pop-up that can show up on the way, answered by clicking its options in order
export interface Interruption {
    shownBy: Answerable<PageElement>;
    answeredBy: Answerable<PageElement>[];
}

const nativeLocatorOf = async (actor: AnswersQuestions, element: Answerable<PageElement>): Promise<Locator> =>
    await (await actor.answer(element)).locator.nativeElement() as Locator;

const isVisible = (locator: Locator): Promise<boolean> =>
    locator.isVisible().catch(() => false);

// Clicks "Continue" through the pages (or tabs within a page) until the target shows up. The
// baggage page, for example, needs one click per flight before it moves on to the extras.
export const ContinueUntilVisibleWithPlaywright = (
    button: Answerable<PageElement>,
    target: Answerable<PageElement>,
    description: string,
    interruptions: Interruption[] = [],
    maxClicks = 8,
) =>
    Interaction.where(`#actor continues until ${ description }`, async actor => {
        const continueButton = await nativeLocatorOf(actor, button);
        const destination = await nativeLocatorOf(actor, target);
        const page = continueButton.page();

        for (let click = 0; click <= maxClicks; click += 1) {
            if (await destination.waitFor({ state: 'visible', timeout: settleTime }).then(() => true, () => false)) {
                return;
            }

            if (click === maxClicks) {
                break;
            }

            const interruption = await (async () => {
                for (const candidate of interruptions) {
                    if (await isVisible(await nativeLocatorOf(actor, candidate.shownBy))) {
                        return candidate;
                    }
                }

                return undefined;
            })();

            if (interruption) {
                for (const answer of interruption.answeredBy) {
                    await (await nativeLocatorOf(actor, answer)).click({ timeout: 15_000 });
                }

                continue;
            }

            await waitForNoLoadingOverlay(page);
            await continueButton.click({ timeout: 30_000 });
        }

        throw new Error(`Could not reach ${ description } after ${ maxClicks } clicks. Current page: ${ page.url() }`);
    });
