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

	scrapeChrome: function (req, res, next) {
		const pageUrl = decodeURIComponent(req.query.url || 'https://www.linkedin.com/in/tomsoderlund/');
		const pageSelector = decodeURIComponent(req.query.selector || 'body');
		console.log(`Scrape: "${pageUrl}", "${pageSelector}"`);
		const timeStart = Date.now();

		const CDP = require('chrome-remote-interface');

		CDP((client) => {
			// Extract used DevTools domains.
			const {Page, Runtime} = client;

			// Enable events on domains we are interested in.
			Promise.all([
				Page.enable()
				]).then(() => {
					return Page.navigate({ url: pageUrl });
				});

			// Evaluate outerHTML after page has loaded.
			Page.loadEventFired(() => {
				setTimeout(() => {
					Runtime.evaluate({ expression: 'document.body.outerHTML' }).then((result) => {
						const timeFinish = Date.now();
						const cheerio = require('cheerio');
						const $ = cheerio.load(result.result.value);
						const resultArray = $(pageSelector).map(function(i, el) {
							// this === el
							return $(this).text();
						}).get();
						console.log(resultArray);
						client.close();
						res.json({ count: resultArray.length, results: resultArray, time: (timeFinish-timeStart) });
					});
				}, 1000); // extra seconds to render Weld
			});
		}).on('error', (err) => {
			console.error('Cannot connect to browser:', err);
			res.status(400).json({ error: err });
		});
	},

	scrapePhantomJS: function (req, res, next) {
		const url = decodeURIComponent(req.query.url);
		const selector = decodeURIComponent(req.query.selector);
		console.log(`Scrape: "${url}", "${selector}"`);

		const parseFunction = function ($) {
			//const selector = decodeURIComponent(req.query.selector);
			console.log('parseFunction', selector);
			return $(selector).map(function() {
				return $(this).text() + '2';
			}).get();
		}
		const parseFunction2 = parseFunction.bind(null, selector);

		const scraperjs = require('scraperjs');
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
	router.get('/api/scrape', scraping.scrapeChrome);

};