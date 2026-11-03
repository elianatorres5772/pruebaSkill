import { By, PageElement, PageElements } from '@serenity-js/web';

import type { ArajetFlight } from '../test-data/ArajetExtrasData.js';
import { xpathLiteral } from './locator.js';

// Arajet mixes straight and curly apostrophes ("Pa’ Picar Combo", "Pa' Brindar Combo"),
// so names are compared without them
const withoutApostrophes = (name: string): string => name.replace(/['’]/g, '');

const nameStartsWith = (name: string): string =>
    `starts-with(translate(normalize-space(), "'’", ""), ${ xpathLiteral(withoutApostrophes(name)) })`;

const bookingExtra = (name: string): string =>
    `//arajet-booking-level-ancillary[.//h6[contains(@class, "title")][${ nameStartsWith(name) }]]`;

const passengerSection = (passenger: number | 'all'): string =>
    passenger === 'all'
        ? '//arajet-booking-extras-per-passenger'
        : `//arajet-booking-extras-per-passenger[.//span[contains(@class, "avatar-number")][normalize-space()=${ xpathLiteral(String(passenger)) }]]`;

const flightSegment = (flight: ArajetFlight | 'both'): string => {
    const segment = '//arajet-booking-extras-per-segment';

    switch (flight) {
        case 'outbound':
            return `${ segment }[not(contains(@class, "--inbound"))]`;
        case 'return':
            return `${ segment }[contains(@class, "--inbound")]`;
        default:
            return segment;
    }
};

const describePassenger = (passenger: number | 'all'): string =>
    passenger === 'all' ? 'every passenger' : `passenger ${ passenger }`;

const describeFlight = (flight: ArajetFlight | 'both'): string =>
    flight === 'both' ? 'both flights' : `the ${ flight } flight`;

export const ArajetExtrasUI = {
    // Arajet shows loading placeholders until the extras are fetched
    extrasList: () =>
        PageElement.located(By.xpath('(//arajet-booking-extras-per-passenger)[1]'))
            .describedAs('extras list'),

    bookingExtra: (name: string) =>
        PageElement.located(By.xpath(bookingExtra(name)))
            .describedAs(`${ name } extra`),

    bookingExtraBody: (name: string) =>
        PageElement.located(
            By.xpath(`${ bookingExtra(name) }//div[contains(@class, "booking-level-ancillary__body")]`),
        ).describedAs(`${ name } extra card`),

    bookingExtraButton: (name: string) =>
        PageElement.located(By.xpath(`${ bookingExtra(name) }//button`))
            .describedAs(`${ name } select button`),

    passengerExtras: (name: string, passenger: number | 'all', flight: ArajetFlight | 'both') =>
        PageElements.located(
            By.xpath(`${ passengerSection(passenger) }${ flightSegment(flight) }//arajet-booking-extra[.//span[${ nameStartsWith(name) }]]`),
        ).describedAs(`${ name } extra for ${ describePassenger(passenger) } on ${ describeFlight(flight) }`),

    // Relative to a passenger extra row
    addButton: 'xpath=.//button[normalize-space()="AGREGAR"]',
    addedButton: 'xpath=.//button[normalize-space()="AGREGADO"]',
    stepperValue: 'xpath=.//arajet-stepper-input//span[contains(@class, "stepper-value")]',
    stepperIncrement: 'xpath=.//arajet-stepper-input//button[@aria-label="Increment"]',
};
