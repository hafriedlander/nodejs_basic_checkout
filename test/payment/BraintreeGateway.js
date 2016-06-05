'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const Order = require('../../models/Order');
const CreditCard = require('../../models/CreditCard');
const GatewayResponse = require('../../models/GatewayResponse');

const fixtures = {
  credentials: {
    good: {
      BRAINTREE_ID: 'foo',
      BRAINTREE_PUBLIC: 'bar',
      BRAINTREE_PRIVATE: 'baz',
    },
  },
  accountCurrencies: {
    good: {
      BRAINTREE_ACCOUNT_CURRENCIES: '{"HKD":"account1"}',
    },
  },
  orders: {
    goodCurrency: new Order({ currency: 'HKD' }),
    badCurrency: new Order({ currency: 'ZZZ' }),
  },
};

describe('Braintree Gateway', function () {
  let braintreeStub = { Environment: { Sandbox: {}, Production: {} } };
  let BraintreeGateway = proxyquire('../../payments/BraintreeGateway', { braintree: braintreeStub });

  describe('constructor()', function () {
    let _originalEnv = {};

    beforeEach(function () {
      _originalEnv = Object.assign({}, process.env);
    });

    afterEach(function () {
      Object.assign(process.env, _originalEnv);
    });

    it('Throws an error on construction if Braintree credentials are not provided in environment', function () {
      assert.throws(function () { new BraintreeGateway(); }, /credentials/);
    });

    it('Throws an error on construction if the Braintree currency mapping is not provided in environment', function () {
      Object.assign(process.env, fixtures.credentials.good);
      assert.throws(function () { new BraintreeGateway(); }, /mapping/);
    });

    let modes = { development: 'Sandbox', production: 'Production' };
    Object.keys(modes).forEach(function (nodeMode) {
      let braintreeMode = modes[nodeMode];

      it('Uses Braintree ' + braintreeMode + ' in node ' + nodeMode + ' mode', function () {
        var connect = braintreeStub.connect = sinon.spy();

        process.env.NODE_ENV = nodeMode;
        Object.assign(process.env, fixtures.credentials.good);
        Object.assign(process.env, fixtures.accountCurrencies.good);

        let gateway = new BraintreeGateway();
        assert.propertyVal(connect.firstCall.args[0], 'environment', braintreeStub.Environment[braintreeMode]);
      });
    });

    it('Calls braintree.connect with credentials from environment variables', function () {
      var connect = braintreeStub.connect = sinon.spy();

      Object.assign(process.env, fixtures.credentials.good);
      Object.assign(process.env, fixtures.accountCurrencies.good);

      let gateway = new BraintreeGateway();

      assert.isTrue(connect.calledOnce);
      assert.propertyVal(connect.firstCall.args[0], 'merchantId', fixtures.credentials.good.BRAINTREE_ID);
      assert.propertyVal(connect.firstCall.args[0], 'publicKey', fixtures.credentials.good.BRAINTREE_PUBLIC);
      assert.propertyVal(connect.firstCall.args[0], 'privateKey', fixtures.credentials.good.BRAINTREE_PRIVATE);
    });
  });

  describe('process()', function () {
    it('Raises an error if currency does not have merchant account', function (done) {
      let gateway = new BraintreeGateway();
      gateway.process(fixtures.orders.badCurrency, new CreditCard(), function (err, data) {
        assert.instanceOf(err, Error);
        assert.match(err.message, /currency/i);
        done();
      });
    });

    it('Calls done with GatewayResponse argument on braintree success', function (done) {
      braintreeStub.connect = function () {
        return {
          transaction: {
            sale: (payment, callback) => callback(null, 'Success'),
          },
        };
      };

      let gateway = new BraintreeGateway();
      gateway.process(fixtures.orders.goodCurrency, new CreditCard(), function (err, data) {
        assert.instanceOf(data, GatewayResponse);
        done();
      });
    });

    it('Calls done with error argument on braintree error', function (done) {
      braintreeStub.connect = function () {
        return {
          transaction: {
            sale: (payment, callback) => callback(new Error(), null),
          },
        };
      };

      let gateway = new BraintreeGateway();
      gateway.process(fixtures.orders.goodCurrency, new CreditCard(), function (err, data) {
        assert.instanceOf(err, Error);
        done();
      });
    });
  });
});
