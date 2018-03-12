
//
// Name:    helper.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict';

// Private functions

const _ = require('lodash');
const url = require('url');
const fs = require('fs');
const async = require('async');
const fetch = require('node-fetch');
const htmlMetadata = require('html-metadata');

const openFile = function (filename, cb) {
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) {
			throw err;
		}
		else if (cb) {
			console.log('openFile: ' + filename);
			cb(data);
		}
	});
};

const completeUrl = (url) => (!_.includes(url, 'http') ? 'http://' : '') + (!_.includes(url, 'www.') ? 'www.' : '') + url;

const lookupAlexaInfo = function (domain, cb) {
	const searchUrl = `https://scraping-service.herokuapp.com/api/scrape?url=https://www.alexa.com/siteinfo/${domain}&selector=$traffic-rank-content+.last&deep=true`;
	fetch(searchUrl)
		.then(results => results.json())
		.then(data => {
			const rankingRaw = _.get(data, 'results.0.items.0.span_span-col_last.div_rank-row.span_globleRank.span_col-pad.div.strong_metrics-data_align-vmiddle', '');
			const rankingFixed = parseInt(rankingRaw.replace(/(\r\n\t|\n|\r\t)/gm, '').replace(/\,/, '').replace(/\ /, ''));
			const rankingFixedNotNaN = isNaN(rankingFixed) ? '' : rankingFixed;
			if (cb) cb(null, { ranking: rankingFixedNotNaN });
		});
};

const lookupSiteTitle = function (domain, cb) {
	console.log(`lookupSiteTitle: ${domain}`);
	const newUrl = completeUrl(domain);
	htmlMetadata(newUrl, (err, data) => {
		const newData = {
			url: newUrl,
			title: _.get(data, 'general.title', ''),
			description: _.get(data, 'general.description', ''),
		}
		cb(err, newData);
	});
};

const lookupAll = function (domain, cb) {
	async.parallel({
			title: lookupSiteTitle.bind(undefined, domain),
			alexa: lookupAlexaInfo.bind(undefined, domain),
		},
		// When all done
		function (err, results) {
			cb(err, results);
		}
	);
};

const processDomains = function (inputFilename, outputFilename='output.tsv') {
	openFile(inputFilename, fileData => {
		const domainArray = fileData.split('\n');
		console.log(`processDomains: ${domainArray.length} domains`);

		async.mapSeries(
			domainArray,
			// For each
			lookupAll,
			// When all done
			function (err, results) {
				const siteText = _.reduce(results, function (memo, siteInfo) {
					return memo + `${siteInfo.title.url}\t${siteInfo.title.title}\t${siteInfo.title.description}\t${siteInfo.alexa.ranking}\n`;
				}, '');
				console.log(`Done! %d results`, results.length, {err});
				fs.writeFile(outputFilename, siteText)
			}
		);

	});
};

// Command line

// process.argv = ['node', 'yourscript.js', ...]
const NR_OF_ARGUMENTS_REQUIRED = 1;
if ((process.argv.length - 2) < NR_OF_ARGUMENTS_REQUIRED) {
	console.log('Usage: node lookup_domains.js [inputfile] [outputfile]');
	console.log('  E.g: node lookup_domains.js input.txt output.tsv');
}
else {
	//.. do run
	processDomains(process.argv[2], process.argv[3]);
}
