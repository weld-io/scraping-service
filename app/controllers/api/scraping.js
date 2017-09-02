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

const parseDOM = (domString, pageSel, complete, deep) => {

	// Use _ instead of . and $ instead of # to allow for easier JavaScript parsing
	const getNodeReference = $node => ($node[0].name) + ($node.attr('class') ? '_'+$node.attr('class').replace(/ /g, '_') : '') + ($node.attr('id') ? '$'+$node.attr('id') : '');

	const traverseChildren = function (parentObj, obj, i, elem) {
		const $node = $(elem);
		const nodeRef = getNodeReference($node);
		// Has children
		if ($node.children().length > 0) {
			obj[nodeRef] = obj[nodeRef] || {};
			// Has children AND text: use '.$text='
			if ($node.text().length > 0) {
				obj[nodeRef].$text = $node.text();
			}
			// Traverse the children
			$node.children().each(traverseChildren.bind(undefined, obj, obj[nodeRef]));
		}
		// Has only text
		else {
			obj[nodeRef] = $node.text();
		}
		// Delete parent.$text if same as this
		if ($node.text() === _.get(parentObj, '$text')) {
			delete parentObj.$text;
		}
	};

	const $ = cheerio.load(domString);
	const resultArray = $(pageSel).map(function (i, el) {
		// this === el
		if (complete) {
			// Complete DOM nodes
			return $(this).toString();
		}
		else if (deep) {
			// Deep objects
			let deepObj = {};
			traverseChildren(undefined, deepObj, undefined, this);
			return deepObj;
		}	
		else {
			// Shallow text
			return $(this).text();
		}
	}).get();
	return resultArray;
};

const scraping = {

	scrapeChrome: function (req, res, next) {
		const pageUrl = decodeURIComponent(req.query.url);
		const pageSelector = decodeURIComponent(req.query.selector || 'body');
		const loadExtraTime = req.query.time || 0;
		const deepResults = req.query.deep || false;
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
							const resultArray = parseDOM(result.result.value, sel, completeResults, deepResults);
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

}

module.exports = function (app, config) {

	const router = express.Router();
	app.use('/', router);

	router.get('/api/scrape', scraping.scrapeChrome);

};