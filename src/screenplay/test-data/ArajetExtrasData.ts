export type ArajetFlight = 'outbound' | 'return';

const BOOKING_EXTRAS = ['Asistencia en Viaje', 'Reembolso total'] as const;

const PASSENGER_EXTRAS = [
    'Equipaje en Bodega 23 kg',
    'Equipaje en cabina 12 kg',
    'Acceso Prioritario',
    'Pa\' Picar Combo',
    'Pa\' Brindar Combo',
    'Instrumento Musical',
    'Equipaje Deportivo',
] as const;

// Extras in the order Arajet shows them, so they can also be referred to by position (1-based)
const EXTRAS_BY_POSITION: readonly string[] = [...BOOKING_EXTRAS, ...PASSENGER_EXTRAS];

export type ArajetBookingExtra = typeof BOOKING_EXTRAS[number];
export type ArajetPassengerExtra = typeof PASSENGER_EXTRAS[number];

export interface ArajetBookingExtraSelection {
    scope: 'booking';
    extra: ArajetBookingExtra;
}

export interface ArajetPassengerExtraSelection {
    scope: 'passenger';
    extra: ArajetPassengerExtra;
    // Position of the passenger in the extras list; infants have no extras
    passenger: number | 'all';
    flight: ArajetFlight | 'both';
    quantity: number;
}

export type ArajetExtraSelection = ArajetBookingExtraSelection | ArajetPassengerExtraSelection;

export interface ArajetExtraParameters {
    extra: string;
    passenger?: string;
    flight?: string;
    quantity?: string;
}

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
    (values as readonly string[]).includes(value);

const parsePassenger = (value: string): number | 'all' => {
    if (value === 'all') {
        return value;
    }

    const passenger = Number(value);

    if (!Number.isInteger(passenger) || passenger < 1) {
        throw new Error(`Extra passenger must be "all" or a passenger number, but got: ${ value }`);
    }

    return passenger;
};

const parseFlight = (value: string): ArajetFlight | 'both' => {
    if (value === 'outbound' || value === 'return' || value === 'both') {
        return value;
    }

    throw new Error(`Extra flight must be "outbound", "return" or "both", but got: ${ value }`);
};

const parseQuantity = (value: string): number => {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(`Extra quantity must be a whole number greater than 0, but got: ${ value }`);
    }

    return quantity;
};

const extraNameFrom = (nameOrPosition: string): string => {
    if (!/^\d+$/.test(nameOrPosition)) {
        return nameOrPosition;
    }

    const name = EXTRAS_BY_POSITION[Number(nameOrPosition) - 1];

    if (!name) {
        throw new Error(`Extra position must be between 1 and ${ EXTRAS_BY_POSITION.length }, but got: ${ nameOrPosition }`);
    }

    return name;
};

const buildArajetExtra = (parameters: ArajetExtraParameters): ArajetExtraSelection => {
    const { passenger, flight, quantity } = parameters;
    const extra = extraNameFrom(parameters.extra);

    if (isOneOf(BOOKING_EXTRAS, extra)) {
        if (passenger || flight || quantity) {
            throw new Error(`${ extra } applies to the whole booking, leave passenger, flight and quantity empty`);
        }

        return { scope: 'booking', extra };
    }

    if (isOneOf(PASSENGER_EXTRAS, extra)) {
        return {
            scope: 'passenger',
            extra,
            passenger: parsePassenger(passenger || 'all'),
            flight: parseFlight(flight || 'both'),
            quantity: parseQuantity(quantity || '1'),
        };
    }

    throw new Error(
        `Unsupported Arajet extra: ${ extra }. Supported extras: ${
            EXTRAS_BY_POSITION.map((name, index) => `${ index + 1 }. ${ name }`).join(', ')
        }`,
    );
};

// Parses "extra[:passenger[:flight[:quantity]]]" items separated by ";", where extra is a name or a position, e.g.
// "Asistencia en Viaje; Acceso Prioritario:all:both; 3:1:outbound:2"
export const buildArajetExtras = (extras: string): ArajetExtraSelection[] =>
    extras
        .split(';')
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => {
            const [extra, passenger, flight, quantity] = item.split(':').map(part => part.trim());

            return buildArajetExtra({ extra, passenger, flight, quantity });
        });
