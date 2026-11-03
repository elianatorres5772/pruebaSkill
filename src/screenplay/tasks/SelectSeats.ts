import { Task } from '@serenity-js/core';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { SelectRandomSeatsWithPlaywright } from '../interactions/SelectRandomSeatsWithPlaywright.js';
import { ArajetSeatMapUI } from '../ui/ArajetSeatMapUI.js';

export const SelectSeats = {
    later: () =>
        Task.where(
            '#actor skips the seat selection',
            ClickWithPlaywright(
                ArajetSeatMapUI.skipButton(),
                'the skip seats button',
            ),
            ClickWithPlaywright(
                ArajetSeatMapUI.selectLaterButton(),
                'the select seats later button',
            ),
        ),

    randomly: () =>
        Task.where(
            '#actor selects random available seats',
            SelectRandomSeatsWithPlaywright(),
        ),
};
