import { Interaction } from '@serenity-js/core';
import type { Locator, Page } from 'playwright';

import { chooseFromAutocomplete } from './ChooseFromAutocompleteWithPlaywright.js';
import type { ArajetCardPayment } from '../test-data/ArajetPaymentData.js';
import { ArajetPaymentUI } from '../ui/ArajetPaymentUI.js';

const fieldTimeout = 20_000;

// The card fields format what is typed (spaces, the "/" of the expiry), so they get one key at a time.
// Typing focuses the field without clicking it, as the floating labels cover some of the inputs.
const typeInto = async (field: Locator, text: string): Promise<void> => {
    await field.pressSequentially(text, { delay: 50, timeout: fieldTimeout });
};

// The Cybersource fields can drop key presses while they are still loading, so the typed digits
// are read back and typed again when they do not match
const typeSecurely = async (field: Locator, digits: string, description: string): Promise<void> => {
    let typed = '';

    for (let attempt = 0; attempt < 3; attempt += 1) {
        await field.waitFor({ state: 'visible', timeout: fieldTimeout });
        await field.fill('');
        await typeInto(field, digits);

        typed = (await field.inputValue()).replace(/\D/g, '');

        if (typed === digits) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1_000));
    }

    throw new Error(`The ${ description } shows ${ typed.length } of the ${ digits.length } digits typed`);
};

// Country and state are autocompletes: type the name and pick the option with exactly that name
const choose = (page: Page, selector: string, name: string, description: string): Promise<void> =>
    chooseFromAutocomplete(page.locator(selector), page.locator(ArajetPaymentUI.autocompleteOption(name)), name, description);

export const FillCardPaymentWithPlaywright = (payment: ArajetCardPayment) =>
    Interaction.where(`#actor fills in the card ending in ${ payment.cardNumber.slice(-4) } and the billing details`, async actor => {
        const payButton = await (await actor.answer(ArajetPaymentUI.payButton())).locator.nativeElement() as Locator;
        const page = payButton.page();

        await page.locator(ArajetPaymentUI.cardHolderName).fill(payment.holderFirstName, { timeout: fieldTimeout });
        await page.locator(ArajetPaymentUI.cardHolderSurname).fill(payment.holderLastName);

        await typeSecurely(page.frameLocator(ArajetPaymentUI.cardNumberFrame).locator(ArajetPaymentUI.cardNumberInput), payment.cardNumber, 'card number');
        await typeInto(page.locator(ArajetPaymentUI.expiry), payment.expiry.replace('/', ''));
        await typeSecurely(page.frameLocator(ArajetPaymentUI.cvvFrame).locator(ArajetPaymentUI.cvvInput), payment.cvv, 'CVV');

        // State and city stay disabled until the country, and then the state, are chosen
        await choose(page, ArajetPaymentUI.country, payment.country, 'the billing country field');
        await page.locator(ArajetPaymentUI.billingAddress).fill(payment.address);
        await choose(page, ArajetPaymentUI.state, payment.state, 'the billing state field');
        await page.locator(ArajetPaymentUI.city).fill(payment.city, { timeout: fieldTimeout });
        await page.locator(ArajetPaymentUI.zipCode).fill(payment.zipCode);

        await page.locator(ArajetPaymentUI.termsCheckbox).check();

        await expectPayButtonEnabled(payButton);
    });

// The pay button stays disabled while any field is invalid, so name those fields instead of timing out on the click
const expectPayButtonEnabled = async (payButton: Locator): Promise<void> => {
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
        if (await payButton.isEnabled()) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 250));
    }

    const invalidFields = await payButton.page().locator('mat-form-field.mat-form-field-invalid, .ng-invalid[formcontrolname], .ng-invalid[data-testid]')
        .evaluateAll(fields => fields.map(field =>
            field.getAttribute('data-testid') ?? field.getAttribute('formcontrolname') ?? field.textContent?.trim().slice(0, 40)));

    throw new Error(`The pay button is still disabled after filling in the card. Invalid fields: ${ invalidFields.join(', ') || 'none reported' }`);
};
