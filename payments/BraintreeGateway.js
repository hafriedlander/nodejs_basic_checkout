'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const braintree = require('braintree');

const Gateway = require('./Gateway');
const GatewayResponse = require('../models/GatewayResponse');

/**
 * A payment gateway implementation that processes using Braintree server-side payments.
 *
 * As braintree ties each merchant ID to a specific currency, each supported currency
 * must be configured with the relevant ID. This gateway will throw an Error when attempting
 * to use a currency which does not have an associated merchant ID.
 *
 * @deprecated Braintree API has deprecated the direct use of credit card details
 */
class BraintreeGateway extends Gateway {
  /**
   * @constructor
   * @env {string} NODE_ENV This gateway uses the Braintree sandbox in all modes except production
   * @env {string} BRAINTREE_ID The primary Braintree merchant ID
   * @env {string} BRAINTREE_PUBLIC The Braintree public key for API access
   * @env {string} BRAINTREE_PRIVATE The Braintree private key for API access
   * @env {string} BRAINTREE_ACCOUNT_CURRENCIES A json-encoded Object of currency => sub-account-ID mappings
   */
  constructor() {
    super();

    if (!process.env.BRAINTREE_ID || !process.env.BRAINTREE_PUBLIC || !process.env.BRAINTREE_PRIVATE) {
      throw new Error('Braintree API credentials must be provided in BRAINTREE_ID, BRAINTREE_PUBLIC and BRAINTREE_PRIVATE env vars');
    }

    if (!process.env.BRAINTREE_ACCOUNT_CURRENCIES) {
      throw new Error('Braintree currency to merchant ID mapping must be provided in BRAINTREE_ACCOUNT_CURRENCIES env var');
    }

    this.gateway = braintree.connect({
      environment: braintree.Environment[process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox'],
      merchantId: process.env.BRAINTREE_ID,
      publicKey: process.env.BRAINTREE_PUBLIC,
      privateKey: process.env.BRAINTREE_PRIVATE,
    });

    this.accounts = JSON.parse(process.env.BRAINTREE_ACCOUNT_CURRENCIES);
  }

  /**
   * Attempt to charge an order to a credit card using Braintree
   *
   * @param {Order} order The order to process
   * @param {CreditCard} creditCard The credit card to charge
   * @param {Function} next A callback that takes the arguments (Error, GatewayResponse), where Error will be provided on
   * error, and GatewayReponse on success
   * @returns null
   */
  process(order, creditCard, next) {
    var merchantAccountId = this.accounts[order.getNormalisedCurrency()];
    if (!merchantAccountId) return next(new Error('Currency not supported by gateway'));

    var sale = {
      merchantAccountId,
      amount: order.price,
      creditCard: {
        cardholderName: creditCard.firstName + ' ' + creditCard.lastName,
        cvv: creditCard.ccv,
        expirationMonth: creditCard.expMonth,
        expirationYear: creditCard.expYear,
        number: creditCard.getNormalisedNumber(),
      },
      options: {
        submitForSettlement: true,
      },
    };

    this.gateway.transaction.sale(sale, function (error, result) {
      if (error) {
        next(error);
      } else {
        next(null, new GatewayResponse({ processor: 'Braintree', response: JSON.stringify(result) }));
      }
    });

  }
}

module.exports = BraintreeGateway;
