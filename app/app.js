const express = require('express');
const glob = require('glob');

const config = require('./config/config');

var app = express();
require('./config/express')(app, config);

module.exports = app;