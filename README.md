# Scraping Service

**Scraping Service** is a REST API for scraping dynamic websites. It uses headless Chrome and Cheerio.

----------

Made by the team at **Weld** ([www.weld.io](https://www.weld.io?utm_source=github-scraping-service)), the #codefree web/app creation tool:

[![Weld](https://s3-eu-west-1.amazonaws.com/weld-social-and-blog/gif/weld_explained.gif?v2)](https://www.weld.io?utm_source=github-scraping-service)


## How to Run

Just start with:

	npm run-script dev # development

or

	npm start # production

Server will default to **http://localhost:3036**


## How to Test

	npm test


## How to Use

Do a HTTP GET:

	http://localhost:3036/api/scrape?url=https://news.ycombinator.com&selector=.title+a

Results:

	{"time":792,"results":[{"selector":".title a","count":61,"items":["Ask a Female Engineer: Thoughts on the Google Memo", ...]}]}

Notes:

* `url` (required)
* `selector` is a JQuery style selector, defaults to `"body"`. You can use multiple selectors separated by comma, which leads to more items in the `results` array.
* `time` e.g. `&time=5000` adds extra loading time before accessing DOM.
* `complete` set to `true` to get full DOM nodes, not just text contents.


## Implementation

Built on Node.js, Express, headless Chrome, Cheerio.


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
