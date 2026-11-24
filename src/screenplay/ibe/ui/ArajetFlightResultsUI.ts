import { By, PageElement } from '@serenity-js/web';

import type { ArajetBundle } from '../test-data/ArajetBookingData.js';
import { xpathLiteral } from '../../ui/locator.js';

// Comfort was renamed Classic, so either card is the middle fare
const fareCardClasses = (bundle: ArajetBundle): string[] =>
    bundle === 'Classic' || bundle === 'Comfort'
        ? ['fare-card--classic', 'fare-card--comfort']
        : [`fare-card--${ bundle.toLowerCase() }`];

// The Basic button reads "Seleccionar con restricciones" and the others "Seleccionar"
const fareSelectionButton = (bundle: ArajetBundle) => {
    const card = fareCardClasses(bundle)
        .map(name => `contains(concat(" ", normalize-space(@class), " "), " ${ name } ")`)
        .join(' or ');

    return PageElement.located(
        By.xpath(`(//*[${ card }]//button[starts-with(normalize-space(), "Seleccionar")])[1]`),
    ).describedAs(`${ bundle } fare selection button`);
};

export const ArajetFlightResultsUI = {
    // Production shows "Selecciona Vuelo De Salida" and UAT "Selecciona vuelo de salida"
    outboundHeading: () =>
        PageElement.located(
            By.xpath('//h3[translate(normalize-space(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="selecciona vuelo de salida"]'),
        ).describedAs('outbound flight results heading'),

    fareSelectionButton,

    // Shows the fares of a flight in the list: "Ver tarifas" on the current site, an accordion header on the old one
    flightFaresToggle: (flightNumber: number) =>
        PageElement.located(
            By.xpath(
                `(//button[contains(@data-testid, ".flight-${ flightNumber }.see-fares")]`
                + ` | (//arajet-available-flights[not(.//button[contains(@data-testid, ".see-fares")])]//a[contains(@class, "p-accordion-header-link")])[${ flightNumber }])[1]`,
            ),
        ).describedAs(`flight ${ flightNumber } fares toggle`),

    // The flight cards of the current site, each one starting with its departure time ("12:55pm Miami (MIA) ...")
    flightCards: 'p-card[data-testid^="ibe.flight-selection.flight-"]',

    // Only shown on the current site, between the flights and the passengers steps
    flightSummaryContinueButton: () =>
        PageElement.located(
            By.xpath('//button[contains(@class, "button--primary")][normalize-space()="Continuar"][not(contains(@data-testid, "passenger-details"))]'),
        ).describedAs('flight summary continue button'),

    passengerHeading: () =>
        PageElement.located(
            By.xpath('//h2[normalize-space()="Pasajeros"]'),
        ).describedAs('passenger information heading'),
};
