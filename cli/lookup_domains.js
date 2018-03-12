
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

const ALL_LINEBREAKS = /(\r\n\t|\n|\r\t)/gm;
const ALL_TABS = /(\t)/gm;

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
	//console.log(`lookupAlexaInfo: ${domain}`);
	const searchUrl = `https://scraping-service.herokuapp.com/api/scrape?url=https://www.alexa.com/siteinfo/${domain}&selector=$traffic-rank-content+.last&deep=true`;
	fetch(searchUrl)
		.then(results => results.json())
		.then(data => {
			const rankingRaw = _.get(data, 'results.0.items.0.span_span-col_last.div_rank-row.span_globleRank.span_col-pad.div.strong_metrics-data_align-vmiddle', '');
			const rankingFixed = parseInt(rankingRaw.replace(ALL_LINEBREAKS, '').replace(/\,/, '').replace(/\ /, ''));
			const rankingFixedNotNaN = isNaN(rankingFixed) ? '' : rankingFixed;
			if (cb) cb(null, { ranking: rankingFixedNotNaN });
		})
		.catch(err => cb(null));
};

const lookupSiteTitle = function (domain, cb) {
	console.log(`Domain: ${domain}`);
	const newUrl = completeUrl(domain);
	htmlMetadata(newUrl, (err, data) => {
		const newData = {
			url: newUrl,
			shortName: _.capitalize(newUrl.split('.')[1]),
			title: _.get(data, 'general.title', '').replace(ALL_LINEBREAKS, '').replace(ALL_TABS, ''),
			description: _.get(data, 'general.description', '').replace(ALL_LINEBREAKS, '').replace(ALL_TABS, ''),
		}
		cb(null, newData); // even if err, don't propagate it
	});
};

const lookupAll = function (domain, cb) {
	async.parallel({
			metadata: lookupSiteTitle.bind(undefined, domain),
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
					const alexaRanking = _.get(siteInfo, 'alexa.ranking', '');
					return memo + `${siteInfo.metadata.url}\t${siteInfo.metadata.title}\t${siteInfo.metadata.description}\t${siteInfo.metadata.shortName}\t${alexaRanking}\n`;
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
