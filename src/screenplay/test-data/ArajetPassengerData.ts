import { faker } from '@faker-js/faker';

import { FAKER_SEED } from '../../config/environment.js';
import passengerNames from './passenger-names.json' with { type: 'json' };

export interface ArajetPassengerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
}

export interface ArajetPrimaryPassengerData extends ArajetPassengerData {
    email: string;
    phoneCountryCode: string;
    phoneNumber: string;
}

interface PassengerName {
    firstName: string;
    lastName: string;
    gender: string;
}

const NATIONALITY = 'Colombia';
const PHONE_COUNTRY_CODE = 'US +1';

const MIN_AGE = 18;
const MAX_AGE = 65;

if (FAKER_SEED !== undefined) {
    faker.seed(FAKER_SEED);
}

const twoDigits = (value: number): string => String(value).padStart(2, '0');

const adultDateOfBirth = (): string => {
    const currentYear = new Date().getFullYear();
    const year = faker.number.int({ min: currentYear - MAX_AGE, max: currentYear - MIN_AGE - 1 });
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 12 });

    return `${ twoDigits(day) }/${ twoDigits(month) }/${ year }`;
};

const randomNames = (count: number): PassengerName[] => {
    const shuffled = faker.helpers.shuffle([...passengerNames as PassengerName[]]);

    return Array.from({ length: count }, (_, index) => shuffled[index % shuffled.length]);
};

const passengerWith = (name: PassengerName): ArajetPassengerData => ({
    firstName: name.firstName,
    lastName: name.lastName,
    dateOfBirth: adultDateOfBirth(),
    nationality: NATIONALITY,
    gender: name.gender,
});

const primaryPassengerWith = (name: PassengerName): ArajetPrimaryPassengerData => {
    const passenger = passengerWith(name);

    return {
        ...passenger,
        email: faker.internet.email({
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            provider: 'example.com',
        }).toLowerCase(),
        phoneCountryCode: PHONE_COUNTRY_CODE,
        phoneNumber: `555${ faker.string.numeric(7) }`,
    };
};

export const syntheticPassenger = (): ArajetPrimaryPassengerData =>
    primaryPassengerWith(randomNames(1)[0]);

export const syntheticPassengers = (
    adults: number,
): [ArajetPrimaryPassengerData, ...ArajetPassengerData[]] => {
    const [primaryName, ...additionalNames] = randomNames(adults);

    return [
        primaryPassengerWith(primaryName),
        ...additionalNames.map(passengerWith),
    ];
};
