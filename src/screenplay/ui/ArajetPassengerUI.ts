import { By, PageElement } from '@serenity-js/web';

import { xpathLiteral } from './locator.js';

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
            By.xpath('//mat-label[normalize-space()="Correo Electrónico *"]/ancestor::div[contains(@class, "mat-mdc-text-field-wrapper")]//input'),
        ).describedAs('email field'),

    termsCheckbox: () =>
        PageElement.located(
            By.xpath('//input[@aria-label="Terms and conditions acknowledgement"]'),
        ).describedAs('terms and conditions checkbox'),

    // Arajet renders one passenger form at a time, titled "Adulto 1", "Adulto 2"...
    passengerHeading: (passengerNumber: number) =>
        PageElement.located(
            By.xpath(`//h3[starts-with(normalize-space(), ${ xpathLiteral(`Adulto ${ passengerNumber }`) })]`),
        ).describedAs(`Adulto ${ passengerNumber } form`),

    // "Guardar" saves the open passenger and opens the next one. The last
    // passenger has no "Guardar"; it is submitted together with the booking.
    saveButton: (passengerNumber: number) =>
        PageElement.located(
            By.xpath(`//h3[starts-with(normalize-space(), ${ xpathLiteral(`Adulto ${ passengerNumber }`) })]/ancestor::*[.//button[normalize-space()="Guardar"]][1]//button[normalize-space()="Guardar" and contains(@class, "button--subtle")]`),
        ).describedAs(`save Adulto ${ passengerNumber } button`),

    submitPassengersButton: () =>
        PageElement.located(
            By.xpath('(//button[normalize-space()="Continuar"])[last()]'),
        ).describedAs('continue with passengers button'),

    continueButton: () =>
        PageElement.located(
            By.xpath('//button[contains(@aria-label, "go to step 4")]'),
        ).describedAs('continue to seat selection'),
};
