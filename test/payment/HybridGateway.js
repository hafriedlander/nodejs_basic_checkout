'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const assert = require('chai').assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const Order = require('../../models/Order');
const CreditCard = require('../../models/CreditCard');

const fixtures = {
  orders: {
    usdCurrency: new Order({ currency: 'USD' }),
    sgdCurrency: new Order({ currency: 'SGD' }),
  },
  cards: {
    amex: new CreditCard({ number: '3782 8224 6310 005' }),
    visa: new CreditCard({ number: '4111 1111 1111 1111' }),
  },
};

describe('Hybrid Gateway', function () {
  let PayPalGatewayStub = class { };
  let BraintreeGatewayStub = class { };

  let HybridGateway = proxyquire('../../payments/HybridGateway', {
    './PayPalGateway': PayPalGatewayStub,
    './BraintreeGateway': BraintreeGatewayStub,
  });

  describe('constructor()', function () {
  });

  describe('process()', function () {
    it('Passes arguments through to PayPalGateway when card type is amex and currency is USD', function () {
      let ppProcess = PayPalGatewayStub.prototype.process = sinon.spy();
      let btProcess = BraintreeGatewayStub.prototype.process = sinon.spy();

      let gateway = new HybridGateway();
      gateway.process(fixtures.orders.usdCurrency, fixtures.cards.amex);

      assert.isTrue(ppProcess.calledOnce);
      assert.isFalse(btProcess.called);
    });

    it('Passes returns an error when card type is amex and currency is not USD', function () {
      let ppProcess = PayPalGatewayStub.prototype.process = sinon.spy();
      let btProcess = BraintreeGatewayStub.prototype.process = sinon.spy();
      let next = sinon.spy();

      let gateway = new HybridGateway();
      gateway.process(fixtures.orders.sgdCurrency, fixtures.cards.amex, next);

      assert.isTrue(next.calledOnce);
      assert.instanceOf(next.firstCall.args[0], Error);

      assert.isFalse(btProcess.called);
      assert.isFalse(ppProcess.called);
    });

    ['USD', 'EUR', 'AUD'].forEach(function (currency) {
      it('Passes arguments through to PayPalGateway when currency is ' + currency, function () {
        let ppProcess = PayPalGatewayStub.prototype.process = sinon.spy();
        let btProcess = BraintreeGatewayStub.prototype.process = sinon.spy();

        let gateway = new HybridGateway();
        gateway.process(new Order({ currency }), new CreditCard());

        assert.isTrue(ppProcess.calledOnce);
        assert.isFalse(btProcess.called);
      });
    });

    it('Passes arguments through to BraintreeGateway when card type is not amex and currency is not USD, AUD or EUR', function () {
      let ppProcess = PayPalGatewayStub.prototype.process = sinon.spy();
      let btProcess = BraintreeGatewayStub.prototype.process = sinon.spy();

      let gateway = new HybridGateway();
      gateway.process(fixtures.orders.sgdCurrency, fixtures.cards.visa);

      assert.isTrue(btProcess.calledOnce);
      assert.isFalse(ppProcess.called);
    });

  });
});
