import { By, PageElement, PageElements } from '@serenity-js/web';

import type { ArajetPassengerType } from '../test-data/ArajetPassengerData.js';
import { xpathLiteral } from './locator.js';

const passengerRowLabels: Record<ArajetPassengerType, string> = {
    adult: 'Adultos',
    child: 'Niños',
    infant: 'Infante',
};

const passengerRow = (type: ArajetPassengerType) =>
    `//arajet-passengers-ibe//div[contains(@class, "passengers__row")][.//span[normalize-space()=${ xpathLiteral(passengerRowLabels[type]) }]]`;

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

    passengerCount: (type: ArajetPassengerType) =>
        PageElement.located(
            By.xpath(`${ passengerRow(type) }//span[contains(@class, "stepper-value")]`),
        ).describedAs(`${ passengerRowLabels[type] } count`),

    increasePassengersButton: (type: ArajetPassengerType) =>
        PageElement.located(
            By.xpath(`${ passengerRow(type) }//button[@aria-label="Increment"]`),
        ).describedAs(`increase ${ passengerRowLabels[type] } button`),

    searchButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Search flights"]'),
        ).describedAs('search flights button'),
};
