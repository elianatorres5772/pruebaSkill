import { Task } from '@serenity-js/core';

import { ClickUntilUrlMatches, nextBookingStep } from '../../interactions/ClickUntilUrlMatches.js';
import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

export const ContinueToSeatSelection = {
    fromPassengerStep: () =>
        Task.where(
            '#actor continues to seat selection',
            ClickUntilUrlMatches(
                ArajetPassengerUI.submitPassengersButton(),
                nextBookingStep,
                'continue to seat selection',
            ),
        ),
};
