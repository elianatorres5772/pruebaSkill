import { Task } from '@serenity-js/core';

import { ClickUntilUrlMatches, nextBookingStep } from '../interactions/ClickUntilUrlMatches.js';
import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { FillCardPaymentWithPlaywright } from '../interactions/FillCardPaymentWithPlaywright.js';
import { WaitUntilVisibleWithPlaywright } from '../interactions/WaitUntilVisibleWithPlaywright.js';
import type { ArajetCardPayment } from '../test-data/ArajetPaymentData.js';
import { ArajetConfirmationUI, ArajetPaymentUI } from '../ui/ArajetPaymentUI.js';

// The payment goes through 3-D Secure before the confirmation page loads, which can take a minute
const confirmationTimeout = 120_000;

export const ContinueToPayment = {
    fromExtrasStep: () =>
        Task.where(
            '#actor continues to the review and payment step',
            ClickUntilUrlMatches(
                ArajetPaymentUI.reviewAndPaymentButton(),
                nextBookingStep,
                'next: review and payment',
            ),
        ),
};

export const PayForBooking = {
    withCard: (payment: ArajetCardPayment) =>
        Task.where(
            `#actor pays for the booking with the card ending in ${ payment.cardNumber.slice(-4) }`,
            ClickWithPlaywright(ArajetPaymentUI.creditCardMethodButton(), 'the credit card payment method'),
            FillCardPaymentWithPlaywright(payment),
            ClickWithPlaywright(ArajetPaymentUI.payButton(), 'pay with credit card'),
            WaitUntilVisibleWithPlaywright(ArajetConfirmationUI.confirmationNumber(), 'the confirmation number', confirmationTimeout),
        ),
};
