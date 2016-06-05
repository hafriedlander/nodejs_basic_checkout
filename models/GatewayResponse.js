'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

/**
 *  Model representing a response from a payment gateway
 *
 *  @property {string} processor The payment processor
 *  @property {string} response The json-encoded response from the processor
 */
class GatewayResponse {
  /**
   * @constructor
   * @param {Object} [data] - the payment gateway response data to load into this model
   */
  constructor(data) {
    data = data || {};

    this.processor = data.processor || '';
    this.response = data.response || '';
  }

  /**
   * Returns an Object with the (normalised) properties of this model but no methods
   * @returns {Object} The normalised properties of this model
   */
  toObject() {
    return {
      processor: this.processor,
      response: this.response,
    };
  }
}

module.exports = GatewayResponse;
