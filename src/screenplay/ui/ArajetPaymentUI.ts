import { By, PageElement } from '@serenity-js/web';

import { xpathLiteral } from './locator.js';

const testId = (id: string): string => `[data-testid="${ id }"]`;

export const ArajetPaymentUI = {
    reviewAndPaymentButton: () =>
        // "Siguiente: revisión y pago" or "SIGUIENTE: REVISIÓN Y PAGO", depending on the site
        PageElement.located(By.xpath(
            '(//button[@data-testid="ibe.extras.continue"]'
            + ' | //button[contains(translate(normalize-space(), "REVISÓNYPAG", "revisónypag"), "revisión y pago")])[1]',
        ))
            .describedAs('next: review and payment button'),

    creditCardMethodButton: () =>
        PageElement.located(
            By.xpath('//*[@data-testid="ibe.payments.method-credit-card"]//button[normalize-space()="Seleccionar"]'),
        ).describedAs('credit card payment method'),

    payButton: () =>
        PageElement.located(By.css(testId('ibe.payments.pay')))
            .describedAs('pay with credit card button'),

    // The card form fields, as Playwright selectors. The card number and the CVV live in
    // Cybersource Microform iframes, so they are reached through their frame.
    cardHolderName: testId('ibe.payments.card-holder-name'),
    cardHolderSurname: testId('ibe.payments.card-holder-surname'),
    cardNumberFrame: `${ testId('ibe.payments.card-number') } iframe`,
    cardNumberInput: '#number',
    cvvFrame: `${ testId('ibe.payments.cvv') } iframe`,
    cvvInput: '#securityCode',
    expiry: testId('ibe.payments.expiration-date'),
    country: testId('ibe.payments.country'),
    billingAddress: testId('ibe.payments.billing-address'),
    state: testId('ibe.payments.state'),
    city: testId('ibe.payments.city'),
    zipCode: testId('ibe.payments.zip-code'),
    termsCheckbox: `${ testId('ibe.payments.terms') } input[type="checkbox"]`,
    autocompleteOption: (name: string) => `xpath=//mat-option[normalize-space()=${ xpathLiteral(name) }]`,
};

export const ArajetConfirmationUI = {
    confirmationNumber: () =>
        PageElement.located(
            By.xpath('//span[normalize-space()="Número de confirmación:"]/following-sibling::span[1]'),
        ).describedAs('confirmation number'),

    confirmationMessage: () =>
        PageElement.located(By.xpath('//arajet-banner-confirmation//p[normalize-space()="Su vuelo está confirmado"]'))
            .describedAs('flight confirmed message'),
};
