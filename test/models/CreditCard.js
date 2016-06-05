'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const assert = require('chai').assert;

const CreditCard = require('../../models/CreditCard');

describe('CreditCard', function () {
  describe('constructor', function () {
    it('can be instantiated with no arguments', function () {
      let cc = new CreditCard();
      assert.instanceOf(cc, CreditCard);
    });

    it('can be instantiated with an object', function () {
      let data = {
        firstName: 'first',
        lastName: 'last',
        number: 'number',
        ccv: 'ccv',
        expMonth: 'expMonth',
        expYear: 'expYear',
      };
      let cc = new CreditCard(data);

      assert.instanceOf(cc, CreditCard);
      Object.keys(data).forEach(k => assert.propertyVal(cc, k, data[k]));
    });
  });

  describe('validate', function () {
    ['firstName', 'lastName', 'number', 'ccv', 'expMonth', 'expYear'].forEach(function (property) {
      it('provides an error if ' + property + ' missing', function () {
        let cc = new CreditCard();
        let errors = cc.validate();
        assert.property(errors, property);
        assert.match(errors[property], /required/);
      });
    });

    ['firstName', 'lastName', 'expMonth', 'expYear'].forEach(function (property) {
      it('accepts any text as a valid ' + property, function () {
        let cc = new CreditCard({ [property]: '_' });
        let errors = cc.validate();

        assert.notProperty(errors, property);
      });
    });

    it('accepts a valid Visa number', function () {
      let cc = new CreditCard({ number: '4111 1111 1111 1111' });
      let errors = cc.validate();

      assert.notProperty(errors, 'number');
    });

    it('accepts a valid Amex number', function () {
      let cc = new CreditCard({ number: '3711 1111 1111 111' });
      let errors = cc.validate();

      assert.notProperty(errors, 'number');
    });

    it('provides an error if number is not of known type', function () {
      let cc = new CreditCard({ number: '1111-1111-1111-1111' });
      let errors = cc.validate();

      assert.property(errors, 'number');
      assert.match(errors.number, /unsupported/);
    });

    it('provides an error if number length is not correct on Visa cards', function () {
      let cc = new CreditCard({ number: '4' });
      let errors = cc.validate();

      assert.property(errors, 'number');
      assert.match(errors.number, /16.*long/);
    });

    it('provides an error if number length is not correct on Amex cards', function () {
      let cc = new CreditCard({ number: '34' });
      let errors = cc.validate();

      assert.property(errors, 'number');
      assert.match(errors.number, /15.*long/);
    });

    it('accepts a valid CCV on Visa cards', function () {
      let cc = new CreditCard({ number: '4111 1111 1111 1111', ccv: '111' });
      let errors = cc.validate();

      assert.notProperty(errors, 'ccv');
    });

    it('accepts a valid CCV on Amex cards', function () {
      let cc = new CreditCard({ number: '3711 1111 1111 111', ccv: '1111' });
      let errors = cc.validate();

      assert.notProperty(errors, 'ccv');
    });

    it('enforces CCV length on Visa cards', function () {
      let cc = new CreditCard({ number: '4', ccv: '1' });
      let errors = cc.validate();

      assert.property(errors, 'ccv');
      assert.match(errors.ccv, /3.*long/);
    });

    it('enforces CCV length on Amex cards', function () {
      let cc = new CreditCard({ number: '34', ccv: '1' });
      let errors = cc.validate();

      assert.property(errors, 'ccv');
      assert.match(errors.ccv, /4.*long/);
    });
  });

  describe('getNormalisedNumber', function () {
    it('strips all non-number characters', function () {
      let cc = new CreditCard({ number: '1111-2222-3333-4444' });
      assert.equal(cc.getNormalisedNumber(), '1111222233334444');
      cc = new CreditCard({ number: '1111 2222 3333 4444' });
      assert.equal(cc.getNormalisedNumber(), '1111222233334444');
      cc = new CreditCard({ number: '1111az2222AZ3333<>4444' });
      assert.equal(cc.getNormalisedNumber(), '1111222233334444');
    });

    it('leaves all number charactesr', function () {
      let cc = new CreditCard({ number: '0123456789' });
      assert.equal(cc.getNormalisedNumber(), '0123456789');
    });
  });

  describe('getType', function () {
    it('identifies numbers starting with 4 as visa', function () {
      let cc = new CreditCard({ number: '4444 3333 2222 1111' });
      assert.equal(cc.getType(), 'visa');
    });

    it('identifies numbers starting with 34 or 37 as amex', function () {
      let cc = new CreditCard({ number: '3411 1111 1111 111' });
      assert.equal(cc.getType(), 'amex');
      cc = new CreditCard({ number: '3711 1111 1111 111' });
      assert.equal(cc.getType(), 'amex');
    });

    [51, 52, 53, 54, 55].forEach(function (prepend) {
      it('identifies numbers starting with ' + prepend + ' as mastercard', function () {
        let cc = new CreditCard({ number: prepend + '11 1111 1111 1111' });
        assert.equal(cc.getType(), 'mastercard');
      });
    });

    it('identifies numbers starting with other numbers as no type', function () {
      let cc = new CreditCard({ number: '3511 1111 1111 1111' });
      assert.isNotOk(cc.getType());

      cc = new CreditCard({ number: '5011 1111 1111 1111' });
      assert.isNotOk(cc.getType());
    });

  });
});
