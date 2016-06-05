'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

/**
 *  Model representing a Credit Card (Visa, MasterCard or Amex)
 *
 *  @property {string} firstName The first name of the card owner
 *  @property {string} lastName The last name of the card owner
 *  @property {string} number The card number (15 or 16 digits, plus any spacer characters)
 *  @property {string} ccv The card security code (3 or 4 digits)
 *  @property {string} expMonth The card expiry month as a two-digit number between 1 and 12 inclusive
 *  @property {string} expYear The card expiry year as a four-digit number
 */
class CreditCard {
  /**
   * @constructor
   * @param {Object} [data] - the credit card data to load into this model
   */
  constructor(data) {
    data = data || {};

    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.number = data.number || '';
    this.ccv = data.ccv || '';
    this.expMonth = data.expMonth || '';
    this.expYear = data.expYear || '';
  }

  /**
   * Validates the properties of this credit card model to ensure they
   * represent a complete and valid set of information about the card.
   * @returns {Object} A set of fieldname: validation_error_message pairs for any validation errors
   */
  validate() {
    var errors = {};

    if (!this.firstName) errors.firstName = 'First name is required';

    if (!this.lastName) errors.lastName = 'Last name is required';

    if (!this.number) {
      errors.number = 'Number is required';
    } else if (!this.getType()) {
      errors.number = 'Number is for unsupported card type';
    } else if (this.getType() == 'amex' && this.getNormalisedNumber().length != 15) {
      errors.number = 'American Express numbers must be 15 digits long';
    } else if (this.getType() != 'amex' && this.getNormalisedNumber().length != 16) {
      errors.number = 'VISA and MasterCard numbers must be 16 digits long';
    }

    if (!this.ccv) {
      errors.ccv = 'CCV is required';
    } else if (this.getType() == 'amex' && this.ccv.length != 4) {
      errors.ccv = 'American Express CCVs must be 4 digits long';
    } else if (this.getType() != 'amex' && this.ccv.length != 3) {
      errors.ccv = 'Visa and MasterCard CCVs must be 3 digits long';
    }

    if (!this.expMonth) errors.expMonth = 'Expiry Month is required';

    if (!this.expYear) errors.expYear = 'Expiry Year is required';

    return errors;
  }

  /**
   * Get the credit card number is a normalised format (any way of entering a specific credit card's
   * number will give the same normalised number).
   * @returns {string} - the normalised number
   */
  getNormalisedNumber() {
    return this.number.replace(/[^0-9]+/g, '');
  }

  /**
   * Calculate the type of the credit card from the number
   * @returns {string} - the calculated type, or null if the type can not be determined
   */
  getType() {
    var number = this.getNormalisedNumber();
    var firstDigit = parseInt(number.substr(0, 1));
    var firstTwoDigits = parseInt(number.substr(0, 2));

    if (firstDigit == 4) return 'visa';
    if (firstTwoDigits == 34 || firstTwoDigits == 37) return 'amex';
    if (firstTwoDigits >= 51 && firstTwoDigits <= 55) return 'mastercard';
  }
}

module.exports = CreditCard;
