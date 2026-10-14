import { Task } from '@serenity-js/core';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { ArajetSeatMapUI } from '../ui/ArajetSeatMapUI.js';

export const SelectSeats = {
    forEachFlight: () =>
        Task.where(
            '#actor selects an available seat for each flight',
            ClickWithPlaywright(
                ArajetSeatMapUI.availableSeat(),
                'the first available seat on the first flight',
            ),
            ClickWithPlaywright(
                ArajetSeatMapUI.nextFlightButton(),
                'the next flight button',
            ),
            ClickWithPlaywright(
                ArajetSeatMapUI.availableSeat(),
                'the first available seat on the return flight',
            ),
            ClickWithPlaywright(
                ArajetSeatMapUI.saveSeatsButton(),
                'the save seats button',
            ),
        ),
};
