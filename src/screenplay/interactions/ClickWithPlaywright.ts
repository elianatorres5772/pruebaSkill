import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import type { PageElement } from '@serenity-js/web';
import type { Locator, Page as PlaywrightPage } from 'playwright';

const LOADING_OVERLAY = '.loader__backdrop';

const waitForNoLoadingOverlay = async (page: PlaywrightPage): Promise<void> => {
    await page
        .waitForFunction(
            (selector: string) =>
                Array.from(document.querySelectorAll(selector)).every(element => {
                    const rect = element.getBoundingClientRect();
                    const style = window.getComputedStyle(element);

                    return (
                        rect.width === 0 ||
                        rect.height === 0 ||
                        style.display === 'none' ||
                        style.visibility === 'hidden' ||
                        style.opacity === '0'
                    );
                }),
            LOADING_OVERLAY,
            { timeout: 20_000 },
        )
        .catch(() => undefined);
};

export const ClickWithPlaywright = (
    element: Answerable<PageElement>,
    description: string,
) =>
    Interaction.where(`#actor clicks ${ description }`, async actor => {
        const pageElement = await actor.answer(element);
        const nativeElement: Locator = await pageElement.locator.nativeElement();
        const nativePage = nativeElement.page();

        await nativeElement.waitFor({ state: 'visible', timeout: 15_000 });

        for (let attempt = 0; attempt < 3; attempt += 1) {
            await waitForNoLoadingOverlay(nativePage);

            try {
                await nativeElement.click({ timeout: 10_000 });

                return;
            } catch (error) {
                if (attempt === 2) {
                    throw error;
                }
            }
        }
    });
