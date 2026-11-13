import { faker } from '@faker-js/faker';

export interface ArajetCardParameters {
    number: string;
    expiry: string;
    cvv: string;
}

export interface ArajetCardPayment {
    cardNumber: string;
    // MM/YYYY
    expiry: string;
    cvv: string;
    holderFirstName: string;
    holderLastName: string;
    country: string;
    state: string;
    city: string;
    address: string;
    zipCode: string;
}

// The billing address has to match a state and a city that Arajet lists for the country
const BILLING = {
    country: 'Estados Unidos',
    state: 'Florida',
    city: 'Miami',
    zipCode: '33101',
} as const;

const required = (value: string | undefined, field: string, format: RegExp, example: string): string => {
    const trimmed = value?.replace(/\s+/g, '') ?? '';

    if (!format.test(trimmed)) {
        throw new Error(`The card ${ field } "${ value ?? '' }" is not valid, e.g. ${ example }`);
    }

    return trimmed;
};

export const buildArajetCardPayment = (card: Partial<ArajetCardParameters>): ArajetCardPayment => ({
    cardNumber: required(card.number, 'number', /^\d{13,19}$/, '4000000000001000'),
    expiry: required(card.expiry, 'expiry', /^(0[1-9]|1[0-2])\/\d{4}$/, '01/2027'),
    cvv: required(card.cvv, 'cvv', /^\d{3,4}$/, '123'),
    holderFirstName: faker.person.firstName(),
    holderLastName: faker.person.lastName(),
    address: faker.location.streetAddress(),
    ...BILLING,
});
