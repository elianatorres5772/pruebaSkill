import { By, PageElement } from '@serenity-js/web';

export const ArajetSeatMapUI = {
    availableSeat: () =>
        PageElement.located(
            By.xpath('(//arajet-seat-item//button[@data-seat-state="available"])[1]'),
        ).describedAs('first available seat'),

    nextFlightButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Siguiente vuelo"]'),
        ).describedAs('next flight button'),

    saveSeatsButton: () =>
        PageElement.located(
            By.xpath('//button[normalize-space()="Guardar asientos"]'),
        ).describedAs('save seats button'),

    heading: () =>
        PageElement.located(
            By.xpath('//h3[normalize-space()="Selección de asiento"]'),
        ).describedAs('seat map heading'),

    summary: () =>
        PageElement.located(By.xpath('//arajet-seat-confirm'))
            .describedAs('selected seat summary'),
};
