'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const assert = require('chai').assert;
const cheerio = require('cheerio');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const express = require('express');
const app = require('../../app.js');

const GatewayResponse = require('../../models/GatewayResponse');

let HybridGatewayStub = class { };
const payment = proxyquire('../../routes/paymentform', {
  '../payments/HybridGateway': HybridGatewayStub,
});

const fixtures = {
  formData: {
    empty: {},
    valid: {
      order: {
        name: 'A B',
        price: '100',
        currency: 'USD',
      },
      card: {
        firstName: 'A',
        lastName: 'B',
        number: '4111-1111-1111-1111',
        ccv: '111',
        expMonth: '01',
        expYear: '2020',
      },
    },
  },
};

function routeRequest(router, method, url, body, callback) {
  // Body is omitable
  if (typeof body == 'function') {
    callback = body;
    body = {};
  }

  let req = { app, method, url, body };

  let res = Object.create(express.response);
  res.req = req;
  res.send = function (data) {
    callback(data, cheerio.load(data));
  };

  router(req, res, function () {});
}

describe('Payment form', function () {
  describe('On first load', function () {
    let $ = null;

    it('Loads', function (done) {
      routeRequest(payment, 'GET', 'http://localhost:3000/', function (html, $html) {
        assert.instanceOf($html, Function);
        $ = $html;
        done();
      });
    });

    describe('Order section', function () {
      let $section;

      it('Exists', function () {
        $section = $('fieldset#order');
        assert.lengthOf($section, 1);
      });

      it('Contains a Price field', function () {
        assert.lengthOf($section.find('input[name="order[price]"]'), 1);
      });

      describe('Currency field', function () {
        let $field;

        it('Exists', function () {
          $field = $section.find('select[name="order[currency]"]');
          assert.lengthOf($field, 1);
        });

        ['USD', 'EUR', 'THB', 'HKD', 'SGD', 'USD'].forEach(function (currency) {
          it('Contains ' + currency, function () {
            assert.lengthOf($field.find('option:contains(' + currency + ')'), 1);
          });
        });
      });

      it('Contains a Customer Full Name field', function () {
        assert.lengthOf($section.find('input[name="order[name]"]'), 1);
      });
    });

    describe('Payment section', function () {
      let $section;

      it('Exists', function () {
        $section = $('fieldset#credit-card');
        assert.lengthOf($section, 1);
      });

      describe('Expiry Month field', function () {
        var $field;

        it('Exists', function () {
          $field = $section.find('select[name="card[expMonth]"]');
          assert.lengthOf($field, 1);
        });

        ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].forEach(function (month) {
          it('Contains month value ' + month, function () {
            assert.lengthOf($field.find('option:contains(' + month + ')'), 1);
          });
        });
      });

    });
  });

  describe('On POST', function () {
    it('Returns the form with validation errors on missing fields', function (done) {
      routeRequest(payment, 'POST', 'http://localhost:3000/', fixtures.formData.empty, function (html, $html) {
        assert.lengthOf($html('form#payment'), 1);
        assert.match(html, /required/i);
        done();
      });
    });

    it('Returns error on gateway error', function (done) {
      HybridGatewayStub.prototype.process = function (o, cc, callback) {
        callback(new Error('error'), null);
      };

      routeRequest(payment, 'POST', 'http://localhost:3000/', fixtures.formData.valid, function (html, $html) {
        assert.match(html, /error/i);
        done();
      });
    });

    it('Returns success on gateway success', function (done) {
      HybridGatewayStub.prototype.process = function (o, cc, callback) {
        callback(null, new GatewayResponse());
      };

      routeRequest(payment, 'POST', 'http://localhost:3000/', fixtures.formData.valid, function (html, $html) {
        assert.match(html, /success/i);
        done();
      });
    });

  });

});
