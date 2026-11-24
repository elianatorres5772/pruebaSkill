import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { ArajetSeatMapUI } from '../ui/ArajetSeatMapUI.js';

export const SeatMap = () =>
    Question.about('the seat map', actor =>
        actor.answer(Text.of(ArajetSeatMapUI.heading())),
    );

export const SeatSummary = () =>
    Question.about('the selected seat summary', actor =>
        actor.answer(Text.of(ArajetSeatMapUI.summary())),
    );

export const AssignedSeats = () =>
    Question.about('the seats assigned to the passengers', async actor => {
        const seats = await actor.answer(Text.ofAll(ArajetSeatMapUI.summarySeats()));

        return seats.map(seat => seat.trim());
    });

// "2 selected" -> 2, for each flight in the booking summary
export const SeatsSelectedPerFlight = () =>
    Question.about('the seats selected on each flight', async actor => {
        const counts = await actor.answer(Text.ofAll(ArajetSeatMapUI.seatsSelectedPerFlight()));

        return counts.map(count => Number(/\d+/.exec(count)?.[0] ?? Number.NaN));
    });
