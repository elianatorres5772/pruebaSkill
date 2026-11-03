import { Question } from '@serenity-js/core';

import { extraQuantity, isBookingExtraAdded, passengerExtraRows } from '../interactions/AddExtrasWithPlaywright.js';
import type { ArajetBookingExtra, ArajetPassengerExtraSelection } from '../test-data/ArajetExtrasData.js';

export const BookingExtraAdded = (extra: ArajetBookingExtra) =>
    Question.about(`whether the ${ extra } extra is added`, actor =>
        isBookingExtraAdded(actor, extra),
    );

export const PassengerExtraQuantities = (selection: ArajetPassengerExtraSelection) =>
    Question.about(`the quantity of ${ selection.extra } for each selected passenger and flight`, async actor => {
        const rows = await passengerExtraRows(actor, selection);

        return Promise.all(rows.map(extraQuantity));
    });
