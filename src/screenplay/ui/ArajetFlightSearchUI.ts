import { By, PageElement, PageElements } from '@serenity-js/web';

import { xpathLiteral } from './locator.js';

const airportOption = (code: string) =>
    PageElements.located(
        By.xpath(
            `//li[@role="option"]//*[contains(@title, ${ xpathLiteral(code) })]`,
        ),
    )
        .first()
        .describedAs(`${ code } airport option`);

export const ArajetFlightSearchUI = {
    originDropdown: () =>
        PageElement.located(
            By.xpath('//div[contains(@class, "routes__container--origin")]//*[@role="button" and @aria-label="dropdown trigger"]'),
        ).describedAs('origin selector'),

    destinationDropdown: () =>
        PageElement.located(
            By.xpath('//div[contains(@class, "routes__container--destination")]//*[@role="button" and @aria-label="dropdown trigger"]'),
        ).describedAs('destination selector'),

    airportOption,

    datePicker: () =>
        PageElement.located(
            By.xpath('//div[contains(@class, "calendar-wrapper")]//input[@role="combobox"]'),
        ).describedAs('travel date selector'),

    date: (date: string) =>
        PageElement.located(
            By.xpath(`//span[@data-date=${ xpathLiteral(date) }]`),
        ).describedAs(`${ date } travel date`),

    continueButton: () =>
        PageElement.located(
            By.xpath('//div[@role="dialog"]//button[normalize-space()="Continuar"]'),
        ).describedAs('continue with selected dates'),

    searchButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Search flights"]'),
        ).describedAs('search flights button'),
};
