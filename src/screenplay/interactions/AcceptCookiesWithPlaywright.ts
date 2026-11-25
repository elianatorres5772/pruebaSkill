import { Interaction } from '@serenity-js/core';
import { By, PageElement } from '@serenity-js/web';
import type { Locator } from 'playwright';

// A new Chrome profile (e.g. on another PC) shows a cookie banner at the bottom of every page until it is accepted,
// and it covers buttons such as the fare "Seleccionar". The persistent profile remembers the choice afterwards.
const acceptButton = PageElement.located(
    By.xpath('//arajet-cookies//div[contains(@class, "cookies-buttons")]//button'),
).describedAs('accept cookies button');

const bannerGrace = 5_000;

export const AcceptCookiesWithPlaywright = () =>
    Interaction.where('#actor accepts the cookies, if asked', async actor => {
        const pageElement: PageElement = await actor.answer(acceptButton);
        const accept: Locator = await pageElement.locator.nativeElement();

        try {
            await accept.waitFor({ state: 'visible', timeout: bannerGrace });
        }
        catch {
            return;
        }

        await accept.click({ timeout: 10_000 });
        await accept.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => undefined);
    });
