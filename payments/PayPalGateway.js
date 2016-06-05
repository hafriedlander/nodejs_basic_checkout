'use strict';

const paypal = require('paypal-rest-sdk');

const Gateway = require('./Gateway');
const GatewayResponse = require('../models/GatewayResponse');

/**
 * A payment gateway implementation that processes using PayPal server-side payments.
 *
 * @deprecated PayPal API has deprecated the direct use of credit card details
 */
class PayPalGateway extends Gateway {
  /**
   * @constructor
   * @env {string} NODE_ENV This gateway uses the PayPal sandbox in all modes except production
   * @env {string} PAYPAL_ID The PayPal account ID
   * @env {string} PAYPAL_SECRET The PayPal API access key
   */
  constructor() {
    super();

    if (!process.env.PAYPAL_ID || !process.env.PAYPAL_SECRET) {
      throw new Error('PayPal API credentials must be provided in PAYPAL_ID and PAYPAL_SECRET env vars');
    }

    paypal.configure({
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
      client_id: process.env.PAYPAL_ID,
      client_secret: process.env.PAYPAL_SECRET,
    });
  }

  /**
   * Attempt to charge an order to a credit card using PayPal
   *
   * @param {Order} order The order to process
   * @param {CreditCard} creditCard The credit card to charge
   * @param {Function} next A callback that takes the arguments (Error, GatewayResponse), where Error will be provided on
   * error, and GatewayReponse on success
   * @returns null
   */
  process(order, creditCard, next) {
    var payment = {
      intent: 'sale',
      payer: {
        payment_method: 'credit_card',
        funding_instruments: [],
      },
      transactions: [],
    };

    payment.payer.funding_instruments.push({
      credit_card: {
        number: creditCard.getNormalisedNumber(),
        type: creditCard.getType(),
        expire_month: creditCard.expMonth,
        expire_year: creditCard.expYear,
        cvv2: creditCard.ccv,
        first_name: creditCard.firstName,
        last_name: creditCard.lastName,
      },
    });

    payment.transactions.push({
      amount: {
        total: order.price,
        currency: order.getNormalisedCurrency(),
      },
    });

    paypal.payment.create(payment, function (error, payment) {
      if (error) {
        next(error);
      } else {
        next(null, new GatewayResponse({ processor: 'PayPal', response: JSON.stringify(payment) }));
      }
    });
  }
}

module.exports = PayPalGateway;
