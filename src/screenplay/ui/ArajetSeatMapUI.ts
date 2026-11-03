import { By, PageElement, PageElements } from '@serenity-js/web';

export const ArajetSeatMapUI = {
    // Exit row seats are left out: they come with extra requirements for the passenger
    availableSeats: () =>
        PageElements.located(
            By.xpath('//arajet-seat-item//button[@data-seat-state="available" and @data-seat-type!="exit"]'),
        ).describedAs('available seats'),

    // Infants share the seat of their adult, so their rows are disabled
    passengerRows: () =>
        PageElements.located(
            By.xpath('//arajet-passenger-panel//button[contains(concat(" ", @class, " "), " passenger-row ") and not(@disabled)]'),
        ).describedAs('passengers that need a seat'),

    flightProgress: () =>
        PageElement.located(
            By.xpath('//arajet-seatmap-header//*[starts-with(normalize-space(), "Vuelo ")][not(*)]'),
        ).describedAs('seat map flight progress'),

    nextFlightButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Siguiente vuelo"]'),
        ).describedAs('next flight button'),

    saveSeatsButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Guardar asientos"]'),
        ).describedAs('save seats button'),

    skipButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Omitir"]'),
        ).describedAs('skip seats button'),

    selectLaterButton: () =>
        PageElement.located(
            By.xpath('//arajet-seatmap-skip-confirmation-modal//button[normalize-space()="Seleccionar asientos más tarde"]'),
        ).describedAs('select seats later button'),

    heading: () =>
        PageElement.located(
            By.xpath('//h3[normalize-space()="Selección de asiento"]'),
        ).describedAs('seat map heading'),

    summary: () =>
        PageElement.located(By.xpath('//arajet-seat-confirm'))
            .describedAs('selected seat summary'),

    summarySeats: () =>
        PageElements.located(
            By.xpath('//arajet-seat-confirm//*[contains(@class, "seat-confirm__seat-chip")]'),
        ).describedAs('seats in the summary'),

    // Relative to a passenger row: the seat on the flight being shown
    currentFlightSeat: 'xpath=.//arajet-seat-badge[contains(@class, "passenger-row__badge--active")]',
};
