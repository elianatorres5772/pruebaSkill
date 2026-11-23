import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { ChooseFromAutocompleteWithPlaywright } from '../interactions/ChooseFromAutocompleteWithPlaywright.js';
import { WaitUntilVisibleWithPlaywright } from '../interactions/WaitUntilVisibleWithPlaywright.js';
import type {
    ArajetPassengerData,
    ArajetPassengerType,
    ArajetPrimaryPassengerData,
} from '../test-data/ArajetPassengerData.js';
import { ArajetPassengerUI, passengerTitle } from '../ui/ArajetPassengerUI.js';

const passengerFormTimeout = 30_000;

const passengerForm = (type: ArajetPassengerType, passengerNumber: number) =>
    WaitUntilVisibleWithPlaywright(
        ArajetPassengerUI.passengerHeading(type, passengerNumber),
        `${ passengerTitle(type, passengerNumber) } form`,
        passengerFormTimeout,
    );

const personalDetails = (passenger: ArajetPassengerData) => [
    Enter.theValue(passenger.firstName).into(ArajetPassengerUI.firstName()),
    Enter.theValue(passenger.lastName).into(ArajetPassengerUI.lastName()),
    Enter.theValue(passenger.dateOfBirth).into(ArajetPassengerUI.dateOfBirth()),
    ChooseFromAutocompleteWithPlaywright(
        passenger.nationality,
        ArajetPassengerUI.nationality(),
        ArajetPassengerUI.nationalityOption(passenger.nationality),
        'the nationality field',
    ),
    Click.on(ArajetPassengerUI.gender(passenger.gender)),
];

const contactDetails = (passenger: ArajetPrimaryPassengerData) => [
    ChooseFromAutocompleteWithPlaywright(
        passenger.phoneCountryCode,
        ArajetPassengerUI.phoneCountryCode(),
        ArajetPassengerUI.phoneCountryCodeOption(passenger.phoneCountryCode),
        'the phone country code field',
    ),
    Enter.theValue(passenger.phoneNumber).into(ArajetPassengerUI.phoneNumber()),
    Enter.theValue(passenger.email).into(ArajetPassengerUI.email()),
];

const saveAndOpenNext = (current: ArajetPassengerData, currentNumber: number, next: ArajetPassengerData) => [
    ClickWithPlaywright(
        ArajetPassengerUI.saveButton(current.type, currentNumber),
        `save ${ passengerTitle(current.type, currentNumber) }`,
    ),
    passengerForm(next.type, currentNumber + 1),
];

export const EnterPassengerInformation = {
    with: (passenger: ArajetPrimaryPassengerData) =>
        EnterPassengerInformation.forAll([passenger]),

    forAll: (passengers: [ArajetPrimaryPassengerData, ...ArajetPassengerData[]]) => {
        const [primary, ...additional] = passengers;

        return Task.where(
            `#actor enters passenger information for ${ passengers.length } passenger(s)`,
            passengerForm(primary.type, 1),
            ...personalDetails(primary),
            ...contactDetails(primary),
            ...additional.flatMap((passenger, index) => [
                ...saveAndOpenNext(passengers[index], index + 1, passenger),
                ...personalDetails(passenger),
            ]),
            Click.on(ArajetPassengerUI.termsCheckbox()),
        );
    },
};
