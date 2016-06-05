'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const assert = require('chai').assert;

const Order = require('../../models/Order');

describe('Order', function () {
  describe('constructor', function () {
    it('can be instantiated with no arguments', function () {
      let order = new Order();
      assert.instanceOf(order, Order);
    });

    it('can be instantiated with an object', function () {
      let data = {
        price: '100',
        currency: 'USD',
        name: 'Name',
      };
      let order = new Order(data);

      assert.instanceOf(order, Order);
      Object.keys(data).forEach(k => assert.propertyVal(order, k, data[k]));
    });
  });

  describe('toObject', function () {
    it('returns an object', function () {
      let order = new Order();
      assert.instanceOf(order.toObject(), Object);
    });

    ['price', 'currency', 'name'].forEach(function (property) {
      it('contains ' + property, function () {
        let order = new Order({ [property]: '1' });
        assert.propertyVal(order, property, '1');
      });
    });
  });

  describe('validate', function () {
    ['price', 'currency', 'name'].forEach(function (property) {
      it('provides an error if ' + property + ' missing', function () {
        let order = new Order();
        let errors = order.validate();

        assert.property(errors, property);
        assert.match(errors[property], /required/);
      });
    });

    it('accepts a valid numeric price', function () {
      let order = new Order({ price: '100' });
      let errors = order.validate();

      assert.notProperty(errors, 'price');
    });

    it('provides an error if price is not a number', function () {
      let order = new Order({ price: 'test' });
      let errors = order.validate();

      assert.property(errors, 'price');
      assert.match(errors.price, /number/);
    });

    it('accepts valid currency', function () {
      let order = new Order({ currency: 'usd' });
      let errors = order.validate();

      assert.notProperty(errors, 'currency');
    });

    it('provides an error if currency is  invalid', function () {
      let order = new Order({ currency: 'ZZZ' });
      let errors = order.validate();

      assert.property(errors, 'currency');
      assert.match(errors.currency, /type/);
    });

    it('accepts any text as a valid name', function () {
      let order = new Order({ name: 'A' });
      let errors = order.validate();

      assert.notProperty(errors, 'name');
    });
  });

  describe('getNormalisedCurrency', function () {
    it('uppercases all text', function () {
      let order = new Order({ currency: 'usd' });
      assert.equal(order.getNormalisedCurrency(), 'USD');
    });
  });

});
