import { Interaction } from '@serenity-js/core';
import { BrowseTheWeb } from '@serenity-js/web';

export const VisitWebsite = (url: string) =>
    Interaction.where(`#actor visits ${ url }`, async actor => {
        const page = await BrowseTheWeb.as(actor).currentPage();
        await page.navigateTo(url);
    });
