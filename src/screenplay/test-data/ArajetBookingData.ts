export type ArajetBundle = 'Basic' | 'Comfort' | 'Extra';

export interface ArajetBookingData {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    bundle: ArajetBundle;
    adults: number;
    children: number;
    infants: number;
}

export interface ArajetBookingParameters {
    origin: string;
    destination: string;
    outDay: string;
    arrivalDay: string;
    bundle: string;
    adults?: string;
    children?: string;
    infants?: string;
}

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

const wholeNumberBetween = (value: string, label: string, min: number, max: number): number => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
        throw new Error(`${ label } must be a whole number between ${ min } and ${ max }`);
    }

    return parsed;
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

    const adults = wholeNumberBetween(parameters.adults ?? '1', 'Adults', 1, MAX_ADULTS);
    const children = wholeNumberBetween(parameters.children ?? '0', 'Children', 0, MAX_ADULTS);
    // Each infant must travel with an adult
    const infants = wholeNumberBetween(parameters.infants ?? '0', 'Infants', 0, adults);

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
        children,
        infants,
    };
};
