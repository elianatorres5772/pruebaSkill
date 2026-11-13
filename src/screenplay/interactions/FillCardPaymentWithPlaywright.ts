import { Interaction } from '@serenity-js/core';
import type { Locator, Page } from 'playwright';

import type { ArajetCardPayment } from '../test-data/ArajetPaymentData.js';
import { ArajetPaymentUI } from '../ui/ArajetPaymentUI.js';

const fieldTimeout = 20_000;

// The card fields format what is typed (spaces, the "/" of the expiry), so they get one key at a time.
// Typing focuses the field without clicking it, as the floating labels cover some of the inputs.
const typeInto = async (field: Locator, text: string): Promise<void> => {
    await field.pressSequentially(text, { delay: 50, timeout: fieldTimeout });
};

// Country and state are autocompletes: open them, type the name and pick the option with exactly that name
const choose = async (page: Page, selector: string, name: string): Promise<void> => {
    await page.locator(selector).click({ timeout: fieldTimeout });
    await typeInto(page.locator(selector), name);
    await page.locator(ArajetPaymentUI.autocompleteOption(name)).click({ timeout: fieldTimeout });
};

export const FillCardPaymentWithPlaywright = (payment: ArajetCardPayment) =>
    Interaction.where(`#actor fills in the card ending in ${ payment.cardNumber.slice(-4) } and the billing details`, async actor => {
        const payButton = await (await actor.answer(ArajetPaymentUI.payButton())).locator.nativeElement() as Locator;
        const page = payButton.page();

        await page.locator(ArajetPaymentUI.cardHolderName).fill(payment.holderFirstName, { timeout: fieldTimeout });
        await page.locator(ArajetPaymentUI.cardHolderSurname).fill(payment.holderLastName);

        await typeInto(page.frameLocator(ArajetPaymentUI.cardNumberFrame).locator(ArajetPaymentUI.cardNumberInput), payment.cardNumber);
        await typeInto(page.locator(ArajetPaymentUI.expiry), payment.expiry.replace('/', ''));
        await typeInto(page.frameLocator(ArajetPaymentUI.cvvFrame).locator(ArajetPaymentUI.cvvInput), payment.cvv);

        // State and city stay disabled until the country, and then the state, are chosen
        await choose(page, ArajetPaymentUI.country, payment.country);
        await page.locator(ArajetPaymentUI.billingAddress).fill(payment.address);
        await choose(page, ArajetPaymentUI.state, payment.state);
        await page.locator(ArajetPaymentUI.city).fill(payment.city, { timeout: fieldTimeout });
        await page.locator(ArajetPaymentUI.zipCode).fill(payment.zipCode);

        await page.locator(ArajetPaymentUI.termsCheckbox).check();
    });
