export type ArajetBundle = 'Basic' | 'Comfort' | 'Extra';

export interface ArajetBookingData {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    bundle: ArajetBundle;
    adults: number;
}

export interface ArajetBookingParameters {
    origin: string;
    destination: string;
    outDay: string;
    arrivalDay: string;
    bundle: string;
    adults?: string;
}

// Arajet limits online bookings to 20 adult passengers.
const MAX_ADULTS = 20;

const toArajetDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${ year }-${ month }-${ day }`;
};

const addDaysFromToday = (days: number): Date => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);

    return date;
};

const parseBundle = (bundle: string): ArajetBundle => {
    if (bundle === 'Basic' || bundle === 'Comfort' || bundle === 'Extra') {
        return bundle;
    }

    throw new Error(`Unsupported Arajet bundle: ${ bundle }`);
};

export const buildArajetBookingData = (
    parameters: ArajetBookingParameters,
): ArajetBookingData => {
    const outDay = Number(parameters.outDay);
    const arrivalDay = Number(parameters.arrivalDay);

    if (!Number.isInteger(outDay) || !Number.isInteger(arrivalDay)) {
        throw new Error('Travel days must be whole numbers');
    }

    const adults = Number(parameters.adults ?? '1');

    if (!Number.isInteger(adults) || adults < 1 || adults > MAX_ADULTS) {
        throw new Error(`Adults must be a whole number between 1 and ${ MAX_ADULTS }`);
    }

    if (arrivalDay <= outDay) {
        throw new Error('The return day must be after the outbound day');
    }

    return {
        origin: parameters.origin,
        destination: parameters.destination,
        departureDate: toArajetDate(addDaysFromToday(outDay)),
        returnDate: toArajetDate(addDaysFromToday(arrivalDay)),
        bundle: parseBundle(parameters.bundle),
        adults,
    };
};
