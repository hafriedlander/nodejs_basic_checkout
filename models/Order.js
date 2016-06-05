'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

/**
 *  Model representing an Order
 *
 *  @property {string} price The total price of the order
 *  @property {string} currency The currency of the order, one of Order.acceptedCurrencies (case-insensitive)
 *  @property {string} name The full name of the order placer
 */
class Order {
  /**
   * @constructor
   * @param {Object} [data] - the order data to load into this model
   */
  constructor(data) {
    data = data || {};

    this.price = data.price || '';
    this.currency = data.currency || '';
    this.name = data.name || '';
  }

  /**
   * Returns an Object with the (normalised) properties of this model but no methods
   * @returns {Object} The normalised properties of this model
   */
  toObject() {
    return {
      price: this.price,
      currency: this.getNormalisedCurrency(),
      name: this.name,
    };
  }

  /**
   * Validates the properties of this order model to ensure they represent a complete and valid set
   * of information about the order.
   * @returns {Object} A set of fieldname: validation_error_message pairs for any validation errors
   */
  validate() {
    var errors = {};

    if (!this.price) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(this.price))) {
      errors.price = 'Price must be a number';
    }

    if (!this.currency) {
      errors.currency = 'Currency is required';
    } else if (Order.acceptedCurrencies.indexOf(this.getNormalisedCurrency()) === -1) {
      errors.currency = 'Currency is not of type accepted';
    }

    if (!this.name) errors.name = 'Name is required';

    return errors;
  }

  /**
   * Get the currency in a normalised format (any way of entering a specific currency will give the same
   * normalised currency).
   * @returns {string} - the normalised currench
   */
  getNormalisedCurrency() {
    return this.currency.toUpperCase();
  }
}

/**
 * An array of currencies that are valid for the order
 * @type {string[]}
 */
Order.acceptedCurrencies = ['USD', 'EUR', 'THB', 'HKD', 'SGD', 'AUD'];

module.exports = Order;
