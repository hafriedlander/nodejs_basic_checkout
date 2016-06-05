'use strict';

/**
 * Starts a webserver running the basic checkout app
 * (C) Hamish Friedlander. Distributable under the GPLv3
 */

// Enable .env parsing
require('dotenv').config();

// Get the main app
const app = require('../app');

// Get the port
const port = process.env.NODE_PORT || 3000;

app.listen(port, function () {
  console.log('Basic checkout listening on port ' + port);
});
