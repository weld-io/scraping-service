//
// Name:    scraping.js
// Purpose: Controller and routing for scraping (Account has Plans)
// Creator: Tom Söderlund
//

'use strict';

const express = require('express');
const _ = require('lodash');
const scraperjs = require('scraperjs');

const helpers = require('../../config/helpers');

const scraping = {

	read: function (req, res, next) {
		const url = decodeURIComponent(req.query.url);
		const selector = decodeURIComponent(req.query.selector);
		const parseFunction = function ($) {
			const selector = '.title a';
			console.log('parseFunction', selector);
			return $(selector).map(function() {
				return $(this).text();
			}).get();
		}
		const parseFunction2 = parseFunction.bind(null, selector);
		console.log(`Scrape: "${url}", "${selector}"`);
		try {
			scraperjs.DynamicScraper.create(url)
				.scrape(parseFunction)
				.then(function (results) {
					//console.log(results);
					res.json({ results: results });
				});
		}
		catch (err) {
			res.status(400).json({ error: err });
		}

	},

}

module.exports = function (app, config) {

	const router = express.Router();
	app.use('/', router);

	// CRUD routes: Account
	router.get('/api/scrape', scraping.read);

};