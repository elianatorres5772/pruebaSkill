import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { SelectOptionWithPlaywright } from '../interactions/SelectOptionWithPlaywright.js';
import type { ArajetBookingData } from '../test-data/ArajetBookingData.js';
import { ArajetFlightSearchUI } from '../ui/ArajetFlightSearchUI.js';

export const SearchForFlight = {
    onArajet: (booking: ArajetBookingData) =>
        Task.where(
            `#actor searches for a round trip from ${ booking.origin } to ${ booking.destination }`,
            SelectOptionWithPlaywright(
                ArajetFlightSearchUI.originDropdown(),
                ArajetFlightSearchUI.airportOption(booking.origin),
                `${ booking.origin } airport option`,
            ),
            SelectOptionWithPlaywright(
                ArajetFlightSearchUI.destinationDropdown(),
                ArajetFlightSearchUI.airportOption(booking.destination),
                `${ booking.destination } airport option`,
            ),
            Click.on(ArajetFlightSearchUI.datePicker()),
            ClickWithPlaywright(
                ArajetFlightSearchUI.date(booking.departureDate),
                `${ booking.departureDate } departure date`,
            ),
            ClickWithPlaywright(
                ArajetFlightSearchUI.date(booking.returnDate),
                `${ booking.returnDate } return date`,
            ),
            ClickWithPlaywright(
                ArajetFlightSearchUI.continueButton(),
                'continue with selected dates',
            ),
            Click.on(ArajetFlightSearchUI.searchButton()),
        ),
};
