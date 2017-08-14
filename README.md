# Scraping Service

**Scraping Service** is a REST API for scraping dynamic websites using [ScraperJS](https://github.com/ruipgil/scraperjs).
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


## Implementation

Built on ScraperJS, Node.js, Express.


## Deploying on Heroku

	# Set up and configure app
	heroku create MYAPPNAME
	heroku config:set NODE_ENV=production
