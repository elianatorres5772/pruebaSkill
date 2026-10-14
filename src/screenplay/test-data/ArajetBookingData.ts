export type ArajetBundle = 'Basic' | 'Comfort' | 'Extra';

export interface ArajetBookingData {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    bundle: ArajetBundle;
}

export interface ArajetBookingParameters {
    origin: string;
    destination: string;
    outDay: string;
    arrivalDay: string;
    bundle: string;
}

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

    if (arrivalDay <= outDay) {
        throw new Error('The return day must be after the outbound day');
    }

    return {
        origin: parameters.origin,
        destination: parameters.destination,
        departureDate: toArajetDate(addDaysFromToday(outDay)),
        returnDate: toArajetDate(addDaysFromToday(arrivalDay)),
        bundle: parseBundle(parameters.bundle),
    };
};
