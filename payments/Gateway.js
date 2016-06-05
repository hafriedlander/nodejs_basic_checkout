'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

/**
 * An abstract base class defining the methods all payment gateways should implement.
 */
class Gateway {
  /**
   * Attempt to charge an order to a credit card
   *
   * @param {Order} order The order to process
   * @param {CreditCard} creditCard The credit card to charge
   * @param {Function} next A callback that takes the arguments (Error, GatewayResponse), where Error will be provided on
   * error, and GatewayReponse on success
   * @returns null
   */
  process(order, creditcard, next) {
    throw new Exception('Must be implemented by a subclass');
  }
}

module.exports = Gateway;
