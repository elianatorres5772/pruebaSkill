import { By, PageElement } from '@serenity-js/web';

import { xpathLiteral } from './locator.js';

const fareSelectionButton = (bundle: string) =>
    PageElement.located(
        By.xpath(
            `(//*[contains(@class, "fare-card--${ bundle.toLowerCase() }")]//button[normalize-space()="Seleccionar"])[1]`,
        ),
    ).describedAs(`${ bundle } fare selection button`);

export const ArajetFlightResultsUI = {
    outboundHeading: () =>
        PageElement.located(
            By.xpath('//h3[normalize-space()="Selecciona Vuelo De Salida"]'),
        ).describedAs('outbound flight results heading'),

    fareSelectionButton,

    returnFlightHeader: () =>
        PageElement.located(
            By.xpath('(//arajet-available-flights//a[contains(@class, "p-accordion-header-link")])[1]'),
        ).describedAs('first return flight'),

    passengerHeading: () =>
        PageElement.located(
            By.xpath('//h2[normalize-space()="Pasajeros"]'),
        ).describedAs('passenger information heading'),
};
