import { Task } from '@serenity-js/core';

import { ClickUntilUrlMatches } from '../interactions/ClickUntilUrlMatches.js';
import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

export const ContinueToSeatSelection = {
    fromPassengerStep: () =>
        Task.where(
            '#actor continues to seat selection',
            ClickUntilUrlMatches(
                ArajetPassengerUI.continueButton(),
                'step=4',
                'continue to seat selection',
            ),
        ),
};
