export interface ArajetPassengerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    gender: string;
    email: string;
    phoneCountryCode: string;
    phoneNumber: string;
}

export const syntheticPassenger = (): ArajetPassengerData => ({
    firstName: 'Automation',
    lastName: 'Tester',
    dateOfBirth: '01/01/1990',
    nationality: 'Colombia',
    gender: 'Femenino',
    email: 'automation.tester@example.com',
    phoneCountryCode: 'US +1',
    phoneNumber: '5551234567',
});
