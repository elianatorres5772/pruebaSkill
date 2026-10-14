import { Question } from '@serenity-js/core';
import { Attribute, Page } from '@serenity-js/web';

import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

// Arajet keeps "Continuar" in the DOM and marks it with "button--disabled"
// until every passenger form and the terms checkbox are complete.
export const PassengerSubmitButtonState = () =>
    Question.about('the state of the continue with passengers button', async actor =>
        actor.answer(Attribute.called('class').of(ArajetPassengerUI.submitPassengersButton())),
    );

export const BookedAdults = () =>
    Question.about('the number of adults in the booking', async actor => {
        const url = await actor.answer(Page.current().url());

        return url.searchParams.get('adt');
    });
