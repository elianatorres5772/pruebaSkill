import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';
import { BrowseTheWeb, type PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

// The booking pages are numbered in the URL ("step=4"), but sites differ in how many steps they have
export const nextBookingStep = (url: URL): string => {
    const step = Number(url.searchParams.get('step'));

    if (!Number.isInteger(step) || step < 1) {
        throw new Error(`Could not read the booking step from ${ url.href }`);
    }

    return `step=${ step + 1 }`;
};

export const ClickUntilUrlMatches = (
    element: Answerable<PageElement>,
    expectedUrlFragment: string | ((currentUrl: URL) => string),
    description: string,
) =>
    Interaction.where(
        `#actor clicks ${ description } until the page reaches ${ typeof expectedUrlFragment === 'string' ? expectedUrlFragment : 'the next step' }`,
        async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();
            const urlFragment = typeof expectedUrlFragment === 'string'
                ? expectedUrlFragment
                : expectedUrlFragment(await page.url());
            let lastError: unknown;

            for (let attempt = 0; attempt < 4; attempt += 1) {
                // A previous click may have navigated after its wait timed out
                if ((await page.url()).href.includes(urlFragment)) {
                    return;
                }

                try {
                    const pageElement = await actor.answer(element);
                    const nativeElement: Locator = await pageElement.locator.nativeElement();
                    await nativeElement.waitFor({ state: 'visible', timeout: 10_000 });
                    await nativeElement.click();

                    await nativeElement.page().waitForFunction(
                        (fragment: string) => window.location.href.includes(fragment),
                        urlFragment,
                        { timeout: 15_000 },
                    );

                    return;
                } catch (error) {
                    lastError = error;
                }
            }

            const currentUrl = (await page.url()).href;

            throw lastError
                ?? new Error(
                    `The page did not reach "${ urlFragment }" after clicking ${ description }. Current URL: ${ currentUrl }`,
                );
        },
    );
