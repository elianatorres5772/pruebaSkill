import { By, PageElement } from '@serenity-js/web';

import type { ArajetPassengerType } from '../test-data/ArajetPassengerData.js';
import { xpathLiteral } from './locator.js';

// Forms are numbered across all passengers, e.g. "Adulto 1", "Niños 2", "Infante 3"
const passengerFormLabels: Record<ArajetPassengerType, string> = {
    adult: 'Adulto',
    child: 'Niños',
    infant: 'Infante',
};

export const passengerTitle = (type: ArajetPassengerType, passengerNumber: number): string =>
    `${ passengerFormLabels[type] } ${ passengerNumber }`;

const passengerHeadingXPath = (type: ArajetPassengerType, passengerNumber: number): string =>
    `//h3[starts-with(normalize-space(), ${ xpathLiteral(passengerTitle(type, passengerNumber)) })]`;

const optionWithText = (text: string) =>
    PageElement.located(
        By.xpath(`//*[@role="option"][normalize-space()=${ xpathLiteral(text) }]`),
    );

export const ArajetPassengerUI = {
    firstName: () =>
        PageElement.located(By.xpath('//input[@name="firstName"]'))
            .describedAs('first name field'),

    lastName: () =>
        PageElement.located(By.xpath('//input[@name="lastName"]'))
            .describedAs('last name field'),

    dateOfBirth: () =>
        PageElement.located(By.xpath('//input[@name="dateOfBirth"]'))
            .describedAs('date of birth field'),

    nationality: () =>
        PageElement.located(By.xpath('//input[@name="nationality"]'))
            .describedAs('nationality field'),

    nationalityOption: (country: string) =>
        optionWithText(country).describedAs(`${ country } nationality option`),

    gender: (gender: string) =>
        PageElement.located(
            By.xpath(`//button[normalize-space()=${ JSON.stringify(gender) }]`),
        ).describedAs(`${ gender } gender option`),

    phoneCountryCode: () =>
        PageElement.located(By.xpath('//input[@name="phoneCountryCode"]'))
            .describedAs('phone country code field'),

    phoneCountryCodeOption: (countryCode: string) =>
        optionWithText(countryCode).describedAs(`${ countryCode } phone country code option`),

    phoneNumber: () =>
        PageElement.located(By.xpath('//input[@name="phoneNumber"]'))
            .describedAs('phone number field'),

    email: () =>
        PageElement.located(
            // "Correo Electrónico *" on production, "Correo electrónico *" on UAT
            By.xpath('//mat-label[translate(normalize-space(), "ABCDEFGHIJKLMNOPQRSTUVWXYZÉ", "abcdefghijklmnopqrstuvwxyzé")="correo electrónico *"]/ancestor::div[contains(@class, "mat-mdc-text-field-wrapper")]//input'),
        ).describedAs('email field'),

    termsCheckbox: () =>
        PageElement.located(
            By.xpath('//input[@aria-label="Terms and conditions acknowledgement"]'),
        ).describedAs('terms and conditions checkbox'),

    passengerHeading: (type: ArajetPassengerType, passengerNumber: number) =>
        PageElement.located(
            By.xpath(passengerHeadingXPath(type, passengerNumber)),
        ).describedAs(`${ passengerTitle(type, passengerNumber) } form`),

    saveButton: (type: ArajetPassengerType, passengerNumber: number) =>
        PageElement.located(
            By.xpath(`${ passengerHeadingXPath(type, passengerNumber) }/ancestor::*[.//button[normalize-space()="Guardar"]][1]//button[normalize-space()="Guardar" and contains(@class, "button--subtle")]`),
        ).describedAs(`save ${ passengerTitle(type, passengerNumber) } button`),

    submitPassengersButton: () =>
        PageElement.located(
            By.xpath('(//button[normalize-space()="Continuar"])[last()]'),
        ).describedAs('continue with passengers button'),
};
