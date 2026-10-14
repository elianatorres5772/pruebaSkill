export interface ArajetPassengerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
}

// Only the primary passenger (Adulto 1) is asked for contact details.
export interface ArajetPrimaryPassengerData extends ArajetPassengerData {
    email: string;
    phoneCountryCode: string;
    phoneNumber: string;
}

export const syntheticPassenger = (): ArajetPrimaryPassengerData => ({
    firstName: 'Automation',
    lastName: 'Tester',
    dateOfBirth: '01/01/1990',
    nationality: 'Colombia',
    gender: 'Femenino',
    email: 'automation.tester@example.com',
    phoneCountryCode: 'US +1',
    phoneNumber: '5551234567',
});

const ADDITIONAL_FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Irene', 'Julian'];

const additionalPassenger = (index: number): ArajetPassengerData => ({
    firstName: ADDITIONAL_FIRST_NAMES[index % ADDITIONAL_FIRST_NAMES.length],
    lastName: 'Tester',
    dateOfBirth: `01/01/${ 1980 + (index % 20) }`,
    nationality: 'Colombia',
    gender: index % 2 === 0 ? 'Masculino' : 'Femenino',
});

export const syntheticPassengers = (
    adults: number,
): [ArajetPrimaryPassengerData, ...ArajetPassengerData[]] => [
    syntheticPassenger(),
    ...Array.from({ length: adults - 1 }, (_, index) => additionalPassenger(index)),
];
