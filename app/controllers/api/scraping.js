//
// Name:    scraping.js
// Purpose: Controller and routing for scraping (Account has Plans)
// Creator: Tom Söderlund
//

'use strict';

const express = require('express');
const _ = require('lodash');

const helpers = require('../../config/helpers');

const scraping = {

	read: function (req, res, next) {
		res.json({});
	},

}

module.exports = function (app, config) {

	const router = express.Router();
	app.use('/', router);

	// CRUD routes: Account
	router.get('/api/scrape', scraping.read);

};