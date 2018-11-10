const express = require('express')

const config = require('./config/config')

var app = express()
require('./config/express')(app, config)

module.exports = app
