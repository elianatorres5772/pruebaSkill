import { Question } from '@serenity-js/core';
import { Attribute, Page } from '@serenity-js/web';

import type { ArajetPassengerType } from '../test-data/ArajetPassengerData.js';
import { ArajetPassengerUI } from '../ui/ArajetPassengerUI.js';

export const PassengerSubmitButtonState = () =>
    Question.about('the state of the continue with passengers button', async actor =>
        actor.answer(Attribute.called('class').of(ArajetPassengerUI.submitPassengersButton())),
    );

const bookedPassengersParameters: Record<ArajetPassengerType, string> = {
    adult: 'adt',
    child: 'chd',
    infant: 'inf',
};

export const BookedPassengers = (type: ArajetPassengerType) =>
    Question.about(`the number of ${ type } passengers in the booking`, async actor => {
        const url = await actor.answer(Page.current().url());

        return url.searchParams.get(bookedPassengersParameters[type]) ?? '0';
    });
