import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import type { ArajetPassengerData } from '../test-data/ArajetPassengerData.js';
import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

export const EnterPassengerInformation = {
    with: (passenger: ArajetPassengerData) =>
        Task.where(
            '#actor enters passenger information',
            Enter.theValue(passenger.firstName).into(ArajetPassengerUI.firstName()),
            Enter.theValue(passenger.lastName).into(ArajetPassengerUI.lastName()),
            Enter.theValue(passenger.dateOfBirth).into(ArajetPassengerUI.dateOfBirth()),
            Enter.theValue(passenger.nationality).into(ArajetPassengerUI.nationality()),
            ClickWithPlaywright(
                ArajetPassengerUI.nationalityOption(passenger.nationality),
                `${ passenger.nationality } nationality option`,
            ),
            Click.on(ArajetPassengerUI.gender(passenger.gender)),
            Enter.theValue(passenger.phoneCountryCode).into(ArajetPassengerUI.phoneCountryCode()),
            ClickWithPlaywright(
                ArajetPassengerUI.phoneCountryCodeOption(passenger.phoneCountryCode),
                `${ passenger.phoneCountryCode } phone country code option`,
            ),
            Enter.theValue(passenger.phoneNumber).into(ArajetPassengerUI.phoneNumber()),
            Enter.theValue(passenger.email).into(ArajetPassengerUI.email()),
            Click.on(ArajetPassengerUI.termsCheckbox()),
        ),
};
