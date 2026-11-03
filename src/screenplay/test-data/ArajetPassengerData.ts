import { faker } from '@faker-js/faker';

import { FAKER_SEED } from '../../config/environment.js';
import passengerNames from './passenger-names.json' with { type: 'json' };

export type ArajetPassengerType = 'adult' | 'child' | 'infant';

export interface ArajetPassengerData {
    type: ArajetPassengerType;
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

export interface ArajetPassengerCounts {
    adults: number;
    children: number;
    infants: number;
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

// Children are 2 to 12 years old and infants 0 to 2 years old. The margin keeps
// each passenger in their age group for every day of a trip booked up to two
// months ahead, and infants must be at least 8 days old to fly.
const CHILD_MIN_AGE = 2;
const CHILD_MAX_AGE = 12;
const INFANT_MAX_AGE = 2;
const AGE_GROUP_MARGIN_IN_DAYS = 60;
const INFANT_MIN_AGE_IN_DAYS = 15;

if (FAKER_SEED !== undefined) {
    faker.seed(FAKER_SEED);
}

const twoDigits = (value: number): string => String(value).padStart(2, '0');

const toArajetDateOfBirth = (date: Date): string =>
    `${ twoDigits(date.getDate()) }/${ twoDigits(date.getMonth() + 1) }/${ date.getFullYear() }`;

const daysAgo = (days: number, years = 0): Date => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setFullYear(date.getFullYear() - years);
    date.setDate(date.getDate() - days);

    return date;
};

const adultDateOfBirth = (): string => {
    const currentYear = new Date().getFullYear();
    const year = faker.number.int({ min: currentYear - MAX_AGE, max: currentYear - MIN_AGE - 1 });
    const month = faker.number.int({ min: 1, max: 12 });
    const day = faker.number.int({ min: 1, max: 12 });

    return `${ twoDigits(day) }/${ twoDigits(month) }/${ year }`;
};

const childDateOfBirth = (): string =>
    toArajetDateOfBirth(faker.date.between({
        from: daysAgo(-AGE_GROUP_MARGIN_IN_DAYS, CHILD_MAX_AGE),
        to: daysAgo(AGE_GROUP_MARGIN_IN_DAYS, CHILD_MIN_AGE),
    }));

const infantDateOfBirth = (): string =>
    toArajetDateOfBirth(faker.date.between({
        from: daysAgo(-AGE_GROUP_MARGIN_IN_DAYS, INFANT_MAX_AGE),
        to: daysAgo(INFANT_MIN_AGE_IN_DAYS),
    }));

const dateOfBirthFor: Record<ArajetPassengerType, () => string> = {
    adult: adultDateOfBirth,
    child: childDateOfBirth,
    infant: infantDateOfBirth,
};

const randomNames = (count: number): PassengerName[] => {
    const shuffled = faker.helpers.shuffle([...passengerNames as PassengerName[]]);

    return Array.from({ length: count }, (_, index) => shuffled[index % shuffled.length]);
};

const passengerWith = (type: ArajetPassengerType) => (name: PassengerName): ArajetPassengerData => ({
    type,
    firstName: name.firstName,
    lastName: name.lastName,
    dateOfBirth: dateOfBirthFor[type](),
    nationality: NATIONALITY,
    gender: name.gender,
});

const primaryPassengerWith = (name: PassengerName): ArajetPrimaryPassengerData => {
    const passenger = passengerWith('adult')(name);

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

// Arajet lists passengers as adults, then children, then infants
export const syntheticPassengers = (
    { adults, children, infants }: ArajetPassengerCounts,
): [ArajetPrimaryPassengerData, ...ArajetPassengerData[]] => {
    const [primaryName, ...names] = randomNames(adults + children + infants);
    const additionalAdults = names.slice(0, adults - 1);
    const childNames = names.slice(adults - 1, adults - 1 + children);
    const infantNames = names.slice(adults - 1 + children);

    return [
        primaryPassengerWith(primaryName),
        ...additionalAdults.map(passengerWith('adult')),
        ...childNames.map(passengerWith('child')),
        ...infantNames.map(passengerWith('infant')),
    ];
};
