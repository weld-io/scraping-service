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

	{ "count":59, "results":["Ask a Female Engineer: Thoughts on the Google Memo","ycombinator.com",...], "time":1635 }


## Implementation

Built on Node.js, Express, headless Chrome, Cheerio.


## Deploying on Heroku

	# Set up and configure app
	heroku create MYAPPNAME
	heroku config:set NODE_ENV=production

	# PhantomJS: see also files .buildpacks and Aptfile
	heroku stack:set cedar-14
	#heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome
	heroku buildpacks:add --index 1 https://github.com/minted/heroku-buildpack-chrome-headless
	heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nodejs
