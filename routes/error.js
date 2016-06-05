'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

/**
 * Handle errors by rendering error template
 * @param {bool} includeErrorDetails Should error details be included.
 */
module.exports = function (includeErrorDetails) {
  return function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: includeErrorDetails && err,
    });
  };
};
