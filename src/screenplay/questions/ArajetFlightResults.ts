import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { ArajetFlightResultsUI } from '../ui/ArajetFlightResultsUI.js';

export const OutboundFlightResults = () =>
    Question.about('the outbound flight results', actor =>
        actor.answer(Text.of(ArajetFlightResultsUI.outboundHeading())),
    );

export const PassengerInformationStep = () =>
    Question.about('the passenger information step', actor =>
        actor.answer(Text.of(ArajetFlightResultsUI.passengerHeading())),
    );
