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
      PAYPAL_ID: 'foo',
      PAYPAL_SECRET: 'bar',
    },
  },
};

describe('PayPal Gateway', function () {
  let paypalStub = {};
  let PayPalGateway = proxyquire('../../payments/PayPalGateway', { 'paypal-rest-sdk': paypalStub });

  describe('constructor()', function () {
    let _originalEnv = {};

    beforeEach(function () {
      _originalEnv = Object.assign({}, process.env);
    });

    afterEach(function () {
      Object.assign(process.env, _originalEnv);
    });

    it('Throws an error on construction if PayPal credentials are not provided in environment', function () {
      assert.throws(function () { new PayPalGateway(); }, /credentials/);
    });

    let modes = { development: 'sandbox', production: 'live' };
    Object.keys(modes).forEach(function (nodeMode) {
      let paypalMode = modes[nodeMode];

      it('Uses PayPal ' + paypalMode + ' in node ' + nodeMode + ' mode', function () {
        var configure = paypalStub.configure = sinon.spy();

        process.env.NODE_ENV = nodeMode;
        Object.assign(process.env, fixtures.credentials.good);

        let gateway = new PayPalGateway();
        assert.propertyVal(configure.firstCall.args[0], 'mode', paypalMode);
      });
    });

    it('Calls paypal.configure with credentials from environment variables', function () {
      var configure = paypalStub.configure = sinon.spy();

      Object.assign(process.env, fixtures.credentials.good);

      let gateway = new PayPalGateway();

      assert.isTrue(configure.calledOnce);
      assert.propertyVal(configure.firstCall.args[0], 'client_id', fixtures.credentials.good.PAYPAL_ID);
      assert.propertyVal(configure.firstCall.args[0], 'client_secret', fixtures.credentials.good.PAYPAL_SECRET);
    });
  });

  describe('process()', function () {
    it('Calls done with GatewayResponse argument on paypal success', function (done) {
      paypalStub.payment = { create: (payment, callback) => callback(null, 'Success') };

      let gateway = new PayPalGateway();
      gateway.process(new Order(), new CreditCard(), function (err, data) {
        assert.instanceOf(data, GatewayResponse);
        done();
      });
    });

    it('Calls done with error argument on paypal error', function (done) {
      paypalStub.payment = { create: (payment, callback) => callback(new Error(), null) };

      let gateway = new PayPalGateway();
      gateway.process(new Order(), new CreditCard(), function (err, data) {
        assert.instanceOf(err, Error);
        done();
      });
    });
  });
});
