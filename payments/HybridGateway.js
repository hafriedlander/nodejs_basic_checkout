'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const Gateway = require('./Gateway');
const PayPalGateway = require('./PayPalGateway');
const BraintreeGateway = require('./BraintreeGateway');

/**
 * A payment gateway implementation that processes using either PayPal or Braintree server-side payments.
 *
 * PayPal is used in these circumstances
 * - The credit card is Amex
 * - The currency matches one in HybridGateway.ppCurrencies (defaults to USD, EUR, AUD)
 * Braintree is used in all other circumstances

 * An error is passed to the callback if the card is Amex and the currency is not USD
 */
class HybridGateway extends Gateway {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.paypalGateway = new PayPalGateway();
    this.braintreeGateway = new BraintreeGateway();
  }

  /**
   * Attempt to charge an order to a credit card using either Braintree or PayPal depending on the order and credit card details.
   *
   * @param {Order} order The order to process
   * @param {CreditCard} creditCard The credit card to charge
   * @param {Function} next A callback that takes the arguments (Error, GatewayResponse), where Error will be provided on
   * error, and GatewayReponse on success
   * @returns null
   */
  process(order, creditcard, next) {
    let currency = order.getNormalisedCurrency();
    let gateway;

    if (creditcard.getType() === 'amex') {
      if (currency != 'USD') {
        return next(new Error('American Express cards can only be used with USD'));
      }

      gateway = this.paypalGateway;
    } else if (HybridGateway.ppCurrencies.indexOf(currency) !== -1) {
      gateway = this.paypalGateway;
    } else {
      gateway = this.braintreeGateway;
    }

    gateway.process(order, creditcard, next);
  }
}

/**
 * An array of currencies that should be processed using PayPal
 * @type {string[]}
 */
HybridGateway.ppCurrencies = ['USD', 'EUR', 'AUD'];

module.exports = HybridGateway;
