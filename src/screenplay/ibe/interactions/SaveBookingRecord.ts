import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

import { Interaction } from '@serenity-js/core';
import type { Answerable } from '@serenity-js/core';

import { ARAJET_BASE_URL, BOOKINGS_FILE } from '../../../config/environment.js';
import type { ArajetBookingData } from '../test-data/ArajetBookingData.js';
import type { ArajetPrimaryPassengerData } from '../test-data/ArajetPassengerData.js';

export interface ArajetBookingRecord {
    confirmationNumber: string;
    // Arajet finds a booking by its confirmation number and the last name of the primary passenger
    lastName: string;
    firstName: string;
    email: string;
    origin: string;
    destination: string;
    departureDate: string;
    // Local time at the origin, e.g. "12:55pm"
    departureTime: string;
    returnDate: string;
    adults: number;
    children: number;
    infants: number;
    site: string;
    bookedAt: string;
}

const lockTimeout = 30_000;

// "2026-11-4" -> "2026-11-04"
const isoDate = (date: string): string =>
    date.split('-').map(part => part.padStart(2, '0')).join('-');

const readRecords = (file: string): ArajetBookingRecord[] => {
    try {
        return JSON.parse(readFileSync(file, 'utf8')) as ArajetBookingRecord[];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }

        throw new Error(`Could not read the bookings file ${ file }: ${ error }`);
    }
};

// Parallel runs add to the same file, so only one process at a time may read and rewrite it
const withLock = async (file: string, action: () => void): Promise<void> => {
    const lock = `${ file }.lock`;
    const deadline = Date.now() + lockTimeout;

    while (true) {
        try {
            mkdirSync(lock);
            break;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || Date.now() > deadline) {
                throw new Error(`Could not lock the bookings file ${ file }: ${ error }`);
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    try {
        action();
    } finally {
        rmSync(lock, { recursive: true, force: true });
    }
};

export const appendBookingRecord = async (record: ArajetBookingRecord, file = BOOKINGS_FILE): Promise<void> => {
    mkdirSync(path.dirname(file), { recursive: true });

    await withLock(file, () => {
        const records = [...readRecords(file), record];
        const temporary = `${ file }.${ process.pid }.tmp`;

        writeFileSync(temporary, `${ JSON.stringify(records, null, 2) }\n`);
        renameSync(temporary, file);
    });
};

export const SaveBookingRecord = (
    confirmationNumber: Answerable<string>,
    booking: Answerable<ArajetBookingData>,
    primaryPassenger: Answerable<ArajetPrimaryPassengerData>,
) =>
    Interaction.where(`#actor saves the booking to ${ path.relative(process.cwd(), BOOKINGS_FILE) }`, async actor => {
        const flight = await actor.answer(booking);
        const passenger = await actor.answer(primaryPassenger);

        await appendBookingRecord({
            confirmationNumber: (await actor.answer(confirmationNumber)).trim(),
            lastName: passenger.lastName,
            firstName: passenger.firstName,
            email: passenger.email,
            origin: flight.origin,
            destination: flight.destination,
            departureDate: isoDate(flight.departureDate),
            departureTime: flight.departureTime ?? '',
            returnDate: isoDate(flight.returnDate),
            adults: flight.adults,
            children: flight.children,
            infants: flight.infants,
            site: new URL(ARAJET_BASE_URL).hostname,
            bookedAt: new Date().toISOString(),
        });
    });
