'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const express = require('express');
const path = require('path');

const Order = require('../models/Order');
const CreditCard = require('../models/CreditCard');

const GatewayClass = require('../payments/HybridGateway');

const router = express.Router();

/**
 * Prepare the base view data for use in the paymentform template
 * @param {Request} req The current express request object
 * @returns {Object} The data for use in the template
 */
function viewData(req) {
  let formURL = req.originalUrl;

  let currencies = Order.acceptedCurrencies;

  let months = [];
  for (let i = 1; i <= 12; i++) {
    months.push((i.toString().length == 1 ? '0' : '') + i);
  }

  let years = [];
  for (let i = 0; i < 10; i++) {
    years.push((new Date()).getFullYear() + i);
  }

  return {
    formURL,
    currencies,
    months,
    years,
    data: {
      order: {},
      card: {},
    },
    errors: {
      order: {},
      card: {},
    },
  };
}

/**
 * Handler for first loading the payment form.
 * Renders the form to the response
 */
router.get('/', function (req, res) {
  let data = viewData(req);
  res.render('paymentform', data);
});

/**
 * Handler for posting to the payment form.
 *
 * Validates the data, then processes order and saves the gateway response
 * - On validation failure, renders the form to the response including validation error messsages
 * - On gateway failure, renders a failure message
 * - On gateway success, renders a success message
 */
router.post('/', function (req, res) {
  let order = new Order(req.body.order);
  let creditCard = new CreditCard(req.body.card);

  let errors = {
    order: order.validate(),
    card: creditCard.validate(),
  };

  if (Object.keys(errors.order).length || Object.keys(errors.card).length) {
    // On validation failure, re-render the form
    // Alternative implementation: redirect back, maintaining validation errors in session
    var data = viewData(req);
    Object.assign(data.data, req.body);
    Object.assign(data.errors, errors);
    res.render('paymentform', data);
  } else {
    // On validation success, use a payment gateway to process the payment
    let gateway = new GatewayClass();

    gateway.process(order, creditCard, function (err, data) {
      if (err) {
        // On gateway error, render a failure page
        res.status(500);
        res.render('error', {
          message: 'Error processing payment',
          error: err,
        });
      } else {
        // On gateway success, render a success page
        res.render('success', { result: data });

        // And store the data in a MongoDB or TingoDB database if provided
        let db = res.app.locals.db;
        if (db) db.collection('orders').insert({
          order: order.toObject(),
          result: data.toObject(),
        });
      }
    });
  }

});

module.exports = router;

