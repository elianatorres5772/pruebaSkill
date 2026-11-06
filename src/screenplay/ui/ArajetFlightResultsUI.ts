import { By, PageElement } from '@serenity-js/web';

import { xpathLiteral } from './locator.js';

const fareSelectionButton = (bundle: string) =>
    PageElement.located(
        By.xpath(
            `(//*[contains(@class, "fare-card--${ bundle.toLowerCase() }")]//button[normalize-space()="Seleccionar"])[1]`,
        ),
    ).describedAs(`${ bundle } fare selection button`);

export const ArajetFlightResultsUI = {
    // Production shows "Selecciona Vuelo De Salida" and UAT "Selecciona vuelo de salida"
    outboundHeading: () =>
        PageElement.located(
            By.xpath('//h3[translate(normalize-space(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="selecciona vuelo de salida"]'),
        ).describedAs('outbound flight results heading'),

    fareSelectionButton,

    // Shows the fares of the first flight: "Ver tarifas" on the current site, an accordion header on the old one
    firstFlightFaresToggle: () =>
        PageElement.located(
            By.xpath(
                '(//button[contains(@data-testid, ".flight-1.see-fares")]'
                + ' | //arajet-available-flights[not(.//button[contains(@data-testid, ".see-fares")])]//a[contains(@class, "p-accordion-header-link")])[1]',
            ),
        ).describedAs('first flight fares toggle'),

    // Only shown on the current site, between the flights and the passengers steps
    flightSummaryContinueButton: () =>
        PageElement.located(
            By.xpath('//button[contains(@class, "button--primary")][normalize-space()="Continuar"]'),
        ).describedAs('flight summary continue button'),

    passengerHeading: () =>
        PageElement.located(
            By.xpath('//h2[normalize-space()="Pasajeros"]'),
        ).describedAs('passenger information heading'),
};
