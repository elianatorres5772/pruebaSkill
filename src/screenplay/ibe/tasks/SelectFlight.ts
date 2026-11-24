import { Task } from '@serenity-js/core';

import {
    ContinuePastFlightSummaryWithPlaywright,
    SelectFareWithPlaywright,
    WaitForReturnFlightsWithPlaywright,
} from '../interactions/FlightFaresWithPlaywright.js';
import type { ArajetBundle } from '../test-data/ArajetBookingData.js';

export const SelectOutboundFlight = {
    // flightNumber: position of the flight in the outbound list, starting at 1
    withBundle: (bundle: ArajetBundle, flightNumber = 1) =>
        Task.where(
            `#actor selects the ${ bundle } bundle for the outbound flight`,
            SelectFareWithPlaywright(bundle, flightNumber),
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
