'use strict';

// (C) Hamish Friedlander. Distributable under the GPLv3.

// Core libraries
const path = require('path');
const fs = require('fs');

// Express
const express = require('express');
const bodyParser = require('body-parser');

// TingoDB
const tingodb = require('tingodb')();

// Create app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Handle regular form bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
let dbDir = path.join(__dirname, '.db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
app.locals.db  = new tingodb.Db(dbDir, {});

// Handle requests for static resources
app.use(express.static(path.join(__dirname, 'public')));

// App-specific routing
app.all('/', require('./routes/paymentform'));

// Catch 404 and forward to error handler
app.use(require('./routes/notfound'));

// Error handler
app.use(require('./routes/error')(app.get('env') === 'development'));

module.exports = app;
