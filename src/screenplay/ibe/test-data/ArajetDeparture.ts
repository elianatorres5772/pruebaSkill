import { MAX_HOURS_BEFORE_DEPARTURE, MIN_HOURS_BEFORE_DEPARTURE } from '../../../config/environment.js';

// Arajet shows departure times in the local time of the origin airport
const AIRPORT_TIME_ZONES: Record<string, string> = {
    SDQ: 'America/Santo_Domingo', PUJ: 'America/Santo_Domingo', STI: 'America/Santo_Domingo',
    LRM: 'America/Santo_Domingo', POP: 'America/Santo_Domingo',
    MIA: 'America/New_York', FLL: 'America/New_York', MCO: 'America/New_York', JFK: 'America/New_York',
    EWR: 'America/New_York', BOS: 'America/New_York', IAD: 'America/New_York', ATL: 'America/New_York',
    YYZ: 'America/Toronto', YUL: 'America/Toronto',
    BOG: 'America/Bogota', MDE: 'America/Bogota', CLO: 'America/Bogota', CTG: 'America/Bogota',
    CUN: 'America/Cancun', MEX: 'America/Mexico_City', GDL: 'America/Mexico_City',
    GUA: 'America/Guatemala', SAL: 'America/El_Salvador', SJO: 'America/Costa_Rica', PTY: 'America/Panama',
    LIM: 'America/Lima', UIO: 'America/Guayaquil', GYE: 'America/Guayaquil', CCS: 'America/Caracas',
    AUA: 'America/Aruba', CUR: 'America/Curacao', SXM: 'America/Lower_Princes', SJU: 'America/Puerto_Rico',
    KIN: 'America/Jamaica', MBJ: 'America/Jamaica', GRU: 'America/Sao_Paulo',
    EZE: 'America/Argentina/Buenos_Aires', SCL: 'America/Santiago',
};

export interface DepartureWindow {
    origin: string;
    timeZone: string;
    earliest: Date;
    latest: Date;
}

const HOUR = 60 * 60 * 1000;

export const timeZoneOf = (airport: string): string => {
    const timeZone = AIRPORT_TIME_ZONES[airport];

    if (!timeZone) {
        throw new Error(`The time zone of ${ airport } is unknown: add it to AIRPORT_TIME_ZONES in ArajetDeparture.ts`);
    }

    return timeZone;
};

// Check-in is open in the 24 hours before departure. The flight must also leave late enough
// to still be booked and checked in, hence the minimum.
export const departureWindow = (origin: string, now = new Date()): DepartureWindow => ({
    origin,
    timeZone: timeZoneOf(origin),
    earliest: new Date(now.getTime() + MIN_HOURS_BEFORE_DEPARTURE * HOUR),
    latest: new Date(now.getTime() + MAX_HOURS_BEFORE_DEPARTURE * HOUR),
});

const partsIn = (instant: Date, timeZone: string) => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone, hourCycle: 'h23',
            year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
        }).formatToParts(instant).map(part => [part.type, Number(part.value)]),
    );

    return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
};

// The calendar date of an instant in a time zone, as Arajet writes it: "2026-11-4"
export const arajetDateIn = (instant: Date, timeZone: string): string => {
    const { year, month, day } = partsIn(instant, timeZone);

    return `${ year }-${ month }-${ day }`;
};

// The dates, in the origin's time zone, on which a flight could leave within the window
export const candidateDates = (window: DepartureWindow): string[] => {
    const dates: string[] = [];

    for (let instant = window.earliest.getTime(); instant <= window.latest.getTime() + 24 * HOUR; instant += 24 * HOUR) {
        const date = arajetDateIn(new Date(Math.min(instant, window.latest.getTime())), window.timeZone);

        if (!dates.includes(date)) {
            dates.push(date);
        }
    }

    return dates;
};

// "2026-11-25" + "12:55pm" in America/New_York -> the instant it stands for
export const departureInstant = (date: string, time: string, timeZone: string): Date => {
    const [year, month, day] = date.split('-').map(Number);
    const match = /^(\d{1,2}):(\d{2})\s*([ap])\.?\s*m\.?$/i.exec(time.trim());

    if (!match) {
        throw new Error(`Could not read the departure time "${ time }"`);
    }

    const hour = (Number(match[1]) % 12) + (match[3].toLowerCase() === 'p' ? 12 : 0);
    const asIfUtc = Date.UTC(year, month - 1, day, hour, Number(match[2]));
    // The offset of the time zone at that moment, e.g. -5 hours for New York in winter
    const local = partsIn(new Date(asIfUtc), timeZone);
    const offset = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second) - asIfUtc;

    return new Date(asIfUtc - offset);
};

export const isWithin = (instant: Date, window: DepartureWindow): boolean =>
    instant >= window.earliest && instant <= window.latest;

export const describeWindow = (window: DepartureWindow): string => {
    const format = (instant: Date) => instant.toLocaleString('es-DO', { timeZone: window.timeZone, dateStyle: 'short', timeStyle: 'short' });

    return `between ${ format(window.earliest) } and ${ format(window.latest) } (${ window.origin } time)`;
};
