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
