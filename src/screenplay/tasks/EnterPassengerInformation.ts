import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { WaitUntilVisibleWithPlaywright } from '../interactions/WaitUntilVisibleWithPlaywright.js';
import type { ArajetPassengerData, ArajetPrimaryPassengerData } from '../test-data/ArajetPassengerData.js';
import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

const passengerFormTimeout = 30_000;

const passengerForm = (passengerNumber: number) =>
    WaitUntilVisibleWithPlaywright(
        ArajetPassengerUI.passengerHeading(passengerNumber),
        `Adulto ${ passengerNumber } form`,
        passengerFormTimeout,
    );

const personalDetails = (passenger: ArajetPassengerData) => [
    Enter.theValue(passenger.firstName).into(ArajetPassengerUI.firstName()),
    Enter.theValue(passenger.lastName).into(ArajetPassengerUI.lastName()),
    Enter.theValue(passenger.dateOfBirth).into(ArajetPassengerUI.dateOfBirth()),
    Enter.theValue(passenger.nationality).into(ArajetPassengerUI.nationality()),
    ClickWithPlaywright(
        ArajetPassengerUI.nationalityOption(passenger.nationality),
        `${ passenger.nationality } nationality option`,
    ),
    Click.on(ArajetPassengerUI.gender(passenger.gender)),
];

const contactDetails = (passenger: ArajetPrimaryPassengerData) => [
    Enter.theValue(passenger.phoneCountryCode).into(ArajetPassengerUI.phoneCountryCode()),
    ClickWithPlaywright(
        ArajetPassengerUI.phoneCountryCodeOption(passenger.phoneCountryCode),
        `${ passenger.phoneCountryCode } phone country code option`,
    ),
    Enter.theValue(passenger.phoneNumber).into(ArajetPassengerUI.phoneNumber()),
    Enter.theValue(passenger.email).into(ArajetPassengerUI.email()),
];

const saveAndOpenNext = (passengerNumber: number) => [
    ClickWithPlaywright(
        ArajetPassengerUI.saveButton(passengerNumber),
        `save Adulto ${ passengerNumber }`,
    ),
    passengerForm(passengerNumber + 1),
];

export const EnterPassengerInformation = {
    with: (passenger: ArajetPrimaryPassengerData) =>
        EnterPassengerInformation.forAll([passenger]),

    forAll: ([primary, ...additional]: [ArajetPrimaryPassengerData, ...ArajetPassengerData[]]) =>
        Task.where(
            `#actor enters passenger information for ${ additional.length + 1 } passenger(s)`,
            passengerForm(1),
            ...personalDetails(primary),
            ...contactDetails(primary),
            ...additional.flatMap((passenger, index) => [
                ...saveAndOpenNext(index + 1),
                ...personalDetails(passenger),
            ]),
            Click.on(ArajetPassengerUI.termsCheckbox()),
        ),
};
