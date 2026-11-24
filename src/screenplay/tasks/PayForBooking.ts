import { Task } from '@serenity-js/core';

import { ClickWithPlaywright } from '../interactions/ClickWithPlaywright.js';
import { ContinueUntilVisibleWithPlaywright } from '../interactions/ContinueUntilVisibleWithPlaywright.js';
import { FillCardPaymentWithPlaywright } from '../interactions/FillCardPaymentWithPlaywright.js';
import { WaitUntilVisibleWithPlaywright } from '../interactions/WaitUntilVisibleWithPlaywright.js';
import type { ArajetCardPayment } from '../test-data/ArajetPaymentData.js';
import { ArajetConfirmationUI, ArajetPaymentUI } from '../ui/ArajetPaymentUI.js';

// The payment goes through 3-D Secure before the confirmation page loads, which can take a minute
const confirmationTimeout = 120_000;

export const ContinueToPayment = {
    // The current site has a baggage page (one tab per flight) and an extras page before the payment;
    // the old one had a single extras page. Both are passed without adding anything.
    fromSeatsStep: () =>
        Task.where(
            '#actor continues to the review and payment step',
            ContinueUntilVisibleWithPlaywright(
                ArajetPaymentUI.stepContinueButton(),
                ArajetPaymentUI.creditCardMethodButton(),
                'the review and payment step',
                [{
                    shownBy: ArajetPaymentUI.assistanceModal(),
                    answeredBy: [ArajetPaymentUI.declineAssistanceOption(), ArajetPaymentUI.assistanceContinueButton()],
                }],
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
