import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import type { ArajetBundle } from '../test-data/ArajetBookingData.js';
import { ArajetFlightResultsUI } from '../ui/ArajetFlightResultsUI.js';

export const SelectOutboundFlight = {
    withBundle: (bundle: ArajetBundle) =>
        Task.where(
            `#actor selects the ${ bundle } bundle for the outbound flight`,
            ClickWithPlaywright(
                ArajetFlightResultsUI.returnFlightHeader(),
                'flight card',
            ),
            ClickWithPlaywright(
                ArajetFlightResultsUI.fareSelectionButton(bundle),
                `${ bundle } fare selection button`,
            ),
        ),
};

export const SelectReturnFlight = {
    withBundle: (bundle: ArajetBundle) =>
        Task.where(
            `#actor selects the ${ bundle } bundle for the return flight`,
            ClickWithPlaywright(
                ArajetFlightResultsUI.returnFlightHeader(),
                'flight card',
            ),
            ClickWithPlaywright(
                ArajetFlightResultsUI.fareSelectionButton(bundle),
                `${ bundle } fare selection button`,
            ),
        ),
};
