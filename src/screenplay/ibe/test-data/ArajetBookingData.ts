// The middle fare is called Classic on the current site and Comfort on the old one
export type ArajetBundle = 'Basic' | 'Classic' | 'Comfort' | 'Extra';

const BUNDLES: readonly ArajetBundle[] = ['Basic', 'Classic', 'Comfort', 'Extra'];

export interface ArajetBookingData {
    origin: string;
    destination: string;
    // Chosen on the search: the first date with a flight leaving within the check-in window
    departureDate: string;
    // e.g. "12:55pm", in the local time of the origin, once the outbound flight is chosen
    departureTime?: string;
    returnDate: string;
    bundle: ArajetBundle;
    adults: number;
    children: number;
    infants: number;
}

export interface ArajetBookingParameters {
    origin: string;
    destination: string;
    arrivalDay: string;
    bundle: string;
    adults?: string;
    children?: string;
    infants?: string;
}

const MAX_ADULTS = 20;

// The outbound flight leaves today or tomorrow, so the return is at least two days from today
const MIN_RETURN_DAY = 2;

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

export const parseBundle = (bundle: string): ArajetBundle => {
    const known = BUNDLES.find(name => name === bundle);

    if (known) {
        return known;
    }

    throw new Error(`Unsupported Arajet bundle: ${ bundle }. Use one of ${ BUNDLES.join(', ') }`);
};

export const buildArajetBookingData = (
    parameters: ArajetBookingParameters,
): ArajetBookingData => {
    const arrivalDay = Number(parameters.arrivalDay);

    if (!Number.isInteger(arrivalDay) || arrivalDay < MIN_RETURN_DAY) {
        throw new Error(`The return day must be a whole number of days from today, at least ${ MIN_RETURN_DAY }`);
    }

    const adults = wholeNumberBetween(parameters.adults ?? '1', 'Adults', 1, MAX_ADULTS);
    const children = wholeNumberBetween(parameters.children ?? '0', 'Children', 0, MAX_ADULTS);
    // Each infant must travel with an adult
    const infants = wholeNumberBetween(parameters.infants ?? '0', 'Infants', 0, adults);

    return {
        origin: parameters.origin,
        destination: parameters.destination,
        // Replaced on the search by the date of a flight within the check-in window
        departureDate: toArajetDate(addDaysFromToday(0)),
        returnDate: toArajetDate(addDaysFromToday(arrivalDay)),
        bundle: parseBundle(parameters.bundle),
        adults,
        children,
        infants,
    };
};
