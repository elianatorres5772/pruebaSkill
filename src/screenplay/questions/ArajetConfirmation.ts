import { Question } from '@serenity-js/core';
import { Text } from '@serenity-js/web';

import { ArajetConfirmationUI } from '../ui/ArajetPaymentUI.js';

export const ConfirmationNumber = () =>
    Question.about('the confirmation number', actor =>
        actor.answer(Text.of(ArajetConfirmationUI.confirmationNumber())),
    );

export const ConfirmationMessage = () =>
    Question.about('the confirmation message', actor =>
        actor.answer(Text.of(ArajetConfirmationUI.confirmationMessage())),
    );
