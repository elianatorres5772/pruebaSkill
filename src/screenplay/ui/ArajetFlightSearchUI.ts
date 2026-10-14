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

    originField: () =>
        PageElement.located(
            By.xpath('//div[contains(@class, "routes__container--origin")]'),
        ).describedAs('origin field'),

    destinationField: () =>
        PageElement.located(
            By.xpath('//div[contains(@class, "routes__container--destination")]'),
        ).describedAs('destination field'),

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

    passengersDropdown: () =>
        PageElement.located(
            By.xpath('//arajet-passengers-ibe//button[@aria-haspopup="listbox"]'),
        ).describedAs('passengers selector'),

    passengersPanel: () =>
        PageElement.located(
            By.xpath('//arajet-passengers-ibe//div[contains(@class, "passengers__body")]'),
        ).describedAs('passengers panel'),

    adultsCount: () =>
        PageElement.located(
            By.xpath('//arajet-passengers-ibe//div[contains(@class, "passengers__row")][.//span[normalize-space()="Adultos"]]//span[contains(@class, "stepper-value")]'),
        ).describedAs('adults count'),

    increaseAdultsButton: () =>
        PageElement.located(
            By.xpath('//arajet-passengers-ibe//div[contains(@class, "passengers__row")][.//span[normalize-space()="Adultos"]]//button[@aria-label="Increment"]'),
        ).describedAs('increase adults button'),

    searchButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Search flights"]'),
        ).describedAs('search flights button'),
};
