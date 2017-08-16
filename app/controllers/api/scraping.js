//
// Name:    scraping.js
// Purpose: Controller and routing for scraping (Account has Plans)
// Creator: Tom Söderlund
//

'use strict';

const express = require('express');
const _ = require('lodash');
const cheerio = require('cheerio');

const helpers = require('../../config/helpers');

const parseDOM = (domString, pageSel, complete) => {
	const $ = cheerio.load(domString);
	const resultArray = $(pageSel).map(function(i, el) {
		// this === el
		return complete ? $(this).toString() : $(this).text();
	}).get();
	return resultArray;
};

const scraping = {

	scrapeChrome: function (req, res, next) {
		const pageUrl = decodeURIComponent(req.query.url);
		const pageSelector = decodeURIComponent(req.query.selector || 'body');
		const loadExtraTime = req.query.time || 0;
		const completeResults = req.query.complete || false;
		const timeStart = Date.now();

		console.log(`Scrape: "${pageUrl}", "${pageSelector}", ${loadExtraTime} ms`);

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
						const selectorsArray = pageSelector.split(',');
						const resultsObj = selectorsArray.map((sel) => {
							const resultArray = parseDOM(result.result.value, sel, completeResults);
							return { selector: sel, count: resultArray.length, items: resultArray };
						});
						const timeFinish = Date.now();
						client.close();
						res.json({ time: (timeFinish-timeStart), results: resultsObj });
					});
				}, loadExtraTime); // extra time before accessing DOM
			});
		}).on('error', (err) => {
			console.error('Cannot connect to browser:', err);
			res.status(400).json({ error: err });
		});
	},

	scrapePhantomJS: function (req, res, next) {
		const pageUrl = decodeURIComponent(req.query.url);
		const pageSelector = decodeURIComponent(req.query.selector);
		console.log(`Scrape: "${pageUrl}", "${pageSelector}"`);

		const parseFunction = function ($) {
			//const pageSelector = decodeURIComponent(req.query.selector);
			console.log('parseFunction', pageSelector);
			return $(pageSelector).map(function() {
				return $(this).text();
			}).get();
		}

		const scraperjs = require('scraperjs');
		try {
			scraperjs.DynamicScraper.create(pageUrl)
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