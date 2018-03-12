# Scraping Service

**Scraping Service** is a REST API for scraping dynamic websites using Node.js, headless Chrome and Cheerio.

----------

Made by the team at **Weld** ([www.weld.io](https://www.weld.io?utm_source=github-scraping-service)), the #codefree web/app creation tool:

[![Weld](https://s3-eu-west-1.amazonaws.com/weld-social-and-blog/gif/weld_explained.gif?v2)](https://www.weld.io?utm_source=github-scraping-service)


## How to Run

Start Chrome in headless mode first:

 	# Mac OS X
 	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --disable-gpu --remote-debugging-port=9222

Then start Scraping Service with:

	npm run-script dev # development

or

	npm start # production

Server will default to **http://localhost:3036**


## How to Test

	npm test


## How to Use

### Scrape contents

Do a HTTP GET:

	http://localhost:3036/api/scrape?url=https://news.ycombinator.com&selector=.title+a

Results:

	{"time":792,"results":[{"selector":".title a","count":61,"items":["Ask a Female Engineer: Thoughts on the Google Memo", ...]}]}

Parameters:

* `url` (required)
* `selector` is a JQuery style selector, defaults to `body`. You can use multiple selectors separated by comma, which leads to more items in the `results` array. Use `$` instead of `#` for element ID selectors.
* `time` e.g. `&time=5000` adds extra loading time before accessing DOM.
* `deep` set to `true` to get recursive object trees, not just first-level text contents.
* `complete` set to `true` to get full DOM nodes, not just text contents.

### Scrape metadata

	http://localhost:3036/api/meta?url=https://www.weld.io

Results:

	{
		"url":"https://www.weld.io",
		"general":{
			"appleTouchIcons":[
				{
					"href":"/images/apple-touch-icon.png"
				}
			],
			"icons":[
				{
					"href":"/images/apple-touch-icon.png"
				}
			],
			"canonical":"http://www.weld.io/",
			"description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
			"title":"Weld - The Visual CMS"
		},
		"openGraph":{
			"site_name":"Weld - The Visual CMS",
			"title":"Weld - The Visual CMS",
			"description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
			"locale":"en_US",
			"url":"http://www.weld.io/",
			"image":{
				"url":"https://s3-eu-west-1.amazonaws.com/weld-design-kit/weld-logo-square.png"
			}
		},
		"twitter":{
			"title":"Weld - The Visual CMS",
			"description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
			"card":"summary",
			"url":"http://www.weld.io/",
			"site":"@Weld_io",
			"creator":"@Weld_io",
			"image":"https://s3-eu-west-1.amazonaws.com/weld-design-kit/weld-logo-square.png"
		}
	}


## Command-line interface

	cd cli
	node lookup_domains.js input.txt output.tsv

Results:

	// Domain, Title, Description, Shortname, Alexa ranking
	http://www.microsoft.com	Microsoft Corporation	Get product information, support, and news from Microsoft.	Microsoft	43


## Implementation

Built on Node.js, Express, headless Chrome, Cheerio, html-metadata.


## Deploying on Heroku

Stack: **Heroku-16**

Buildpacks:

	1. https://github.com/heroku/heroku-buildpack-google-chrome
	2. heroku/nodejs

Procfile:

	web: /app/.apt/usr/bin/google-chrome & node app/server.js

### Heroku set-up

	# Set up and configure app
	heroku create MYAPPNAME
	heroku config:set NODE_ENV=production

	# Stack and Buildpacks
	heroku stack:set heroku-16
	heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome
