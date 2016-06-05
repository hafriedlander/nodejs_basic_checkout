'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = router;
