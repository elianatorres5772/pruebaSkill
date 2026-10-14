import { Task } from '@serenity-js/core';
import { Click } from '@serenity-js/web';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { OpenDatePickerWithPlaywright } from '../interactions/OpenDatePickerWithPlaywright.js';
import { SelectAdultsWithPlaywright } from '../interactions/SelectAdultsWithPlaywright.js';
import { SelectOptionWithPlaywright } from '../interactions/SelectOptionWithPlaywright.js';
import type { ArajetBookingData } from '../test-data/ArajetBookingData.js';
import { ArajetFlightSearchUI } from '../ui/ArajetFlightSearchUI.js';

export const SearchForFlight = {
    onArajet: (booking: ArajetBookingData) =>
        Task.where(
            `#actor searches for a round trip from ${ booking.origin } to ${ booking.destination } for ${ booking.adults } adult(s)`,
            SelectOptionWithPlaywright(
                ArajetFlightSearchUI.originDropdown(),
                ArajetFlightSearchUI.airportOption(booking.origin),
                `${ booking.origin } airport option`,
                { field: ArajetFlightSearchUI.originField(), expectedText: booking.origin },
            ),
            SelectOptionWithPlaywright(
                ArajetFlightSearchUI.destinationDropdown(),
                ArajetFlightSearchUI.airportOption(booking.destination),
                `${ booking.destination } airport option`,
                {
                    field: ArajetFlightSearchUI.destinationField(),
                    expectedText: booking.destination,
                    acceptedWhenReady: ArajetFlightSearchUI.datePicker(),
                },
            ),
            OpenDatePickerWithPlaywright(
                ArajetFlightSearchUI.datePicker(),
                ArajetFlightSearchUI.date(booking.departureDate),
            ),
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
            SelectAdultsWithPlaywright(booking.adults),
            Click.on(ArajetFlightSearchUI.searchButton()),
        ),
};
