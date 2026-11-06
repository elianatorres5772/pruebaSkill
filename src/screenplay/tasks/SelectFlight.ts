import { Task } from '@serenity-js/core';

import {
    ContinuePastFlightSummaryWithPlaywright,
    SelectFareWithPlaywright,
    WaitForReturnFlightsWithPlaywright,
} from '../interactions/FlightFaresWithPlaywright.js';
import type { ArajetBundle } from '../test-data/ArajetBookingData.js';

export const SelectOutboundFlight = {
    withBundle: (bundle: ArajetBundle) =>
        Task.where(
            `#actor selects the ${ bundle } bundle for the outbound flight`,
            SelectFareWithPlaywright(bundle),
            WaitForReturnFlightsWithPlaywright(),
        ),
};

export const SelectReturnFlight = {
    withBundle: (bundle: ArajetBundle) =>
        Task.where(
            `#actor selects the ${ bundle } bundle for the return flight`,
            SelectFareWithPlaywright(bundle),
            ContinuePastFlightSummaryWithPlaywright(),
        ),
};
