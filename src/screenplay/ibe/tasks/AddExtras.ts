import { Task } from '@serenity-js/core';

import { AddPassengerExtraWithPlaywright, SelectBookingExtraWithPlaywright } from '../interactions/AddExtrasWithPlaywright.js';
import { WaitUntilVisibleWithPlaywright } from '../../interactions/WaitUntilVisibleWithPlaywright.js';
import type { ArajetExtraSelection } from '../test-data/ArajetExtrasData.js';
import { ArajetExtrasUI } from '../ui/ArajetExtrasUI.js';

const extrasListTimeout = 60_000;

export const AddExtras = {
    toBooking: (extras: ArajetExtraSelection[]) =>
        Task.where(
            `#actor adds ${ extras.length } extra(s) to the booking`,
            WaitUntilVisibleWithPlaywright(ArajetExtrasUI.extrasList(), 'the extras list', extrasListTimeout),
            ...extras.map(selection =>
                selection.scope === 'booking'
                    ? SelectBookingExtraWithPlaywright(selection.extra)
                    : AddPassengerExtraWithPlaywright(selection),
            ),
        ),
};
