# Scraping Service (serverless)

**Scraping Service** is a REST API for scraping dynamic websites using Node.js, Puppeteer and Cheerio. It works in serverless environments such as Vercel.

----------

Made by the team at **Weld** ([www.weldyourownapp.com](https://www.weldyourownapp.com?utm_source=github-scraping-service)), the #codefree web/app creation tool:

[![Weld](https://s3-eu-west-1.amazonaws.com/weld-social-and-blog/gif/weld_explained.gif?v2)](https://www.weldyourownapp.com?utm_source=github-scraping-service)


## How to Run

Start Scraping Service in development mode:

    API=dom yarn dev
    # you can replace `dom` with: dom-simple (just fetch, no Chromium), image, meta, page

or in production mode:

    yarn start

Server will default to **http://localhost:3036**


## Environment variables

* `API`: dom-simple/dom/image/meta/page – for testing only. See /app/controllers/api folder
* `MAX_BROWSER_THREADS`: default 3 Puppeteer browsers
* `RENDER_TIMEOUT`: default 20000 millisecs
* `PORT`: server port
* `NODE_ENV`: Node.js environment


## How to Test

    yarn test


## How to Use

### Scrape DOM

Do a HTTP GET:

    http://localhost:3036/api/dom?url=https://news.ycombinator.com&selector=.title+a

or simple with just Fetch:

    http://localhost:3036/api/dom-simple?url=https://news.ycombinator.com&selector=.title+a

Results:

    {
        "time": 792,
        "results": [
          {
              "selector": ".title a",
              "count": 61,
              "items": [
                "Ask a Female Engineer: Thoughts on the Google Memo",
                (more items...)
              ]
          }
        ]
    }

Parameters:

* `url` (required)
* `selector` is a JQuery style selector, defaults to `body`. You can use multiple selectors separated by comma, which leads to more items in the `results` array. Use `$` instead of `#` for element ID selectors.
* `time` e.g. `time=2000` adds extra loading time before accessing DOM. Use `time=networkidle0` to wait until network requests are idle.
* `deep` set to `true` to get recursive object trees, not just first-level text contents.
* `complete` set to `true` to get complete HTML tags, not just text contents.
* `useIndex` set to `true` to use element index instead of class/id.

### Scrape page content

    http://localhost:3036/api/page?url=https://www.weldyourownapp.com

Results:

    {
      "url": "http://www.tomsoderlund.com",
      "length": 13560,
      "content": "<html>...</html>"
    }

Parameters:

* `url` (required)
* `time` e.g. `&time=2000` adds extra loading time before accessing page content. Default is 100.
* `bodyOnly=true` skips the head of the page

### Scrape metadata

    http://localhost:3036/api/meta?url=https://www.weldyourownapp.com

Results:

    {
      "url":"https://www.weldyourownapp.com",
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
        "canonical":"http://www.weldyourownapp.com/",
        "description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
        "title":"Weld - The Visual CMS"
      },
      "openGraph":{
        "site_name":"Weld - The Visual CMS",
        "title":"Weld - The Visual CMS",
        "description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
        "locale":"en_US",
        "url":"http://www.weldyourownapp.com/",
        "image":{
          "url":"https://s3-eu-west-1.amazonaws.com/weld-design-kit/weld-logo-square.png"
        }
      },
      "twitter":{
        "title":"Weld - The Visual CMS",
        "description":"Create visual, animated, interactive content on your existing web/e-commerce platform.",
        "card":"summary",
        "url":"http://www.weldyourownapp.com/",
        "site":"@Weld_io",
        "creator":"@Weld_io",
        "image":"https://s3-eu-west-1.amazonaws.com/weld-design-kit/weld-logo-square.png"
      }
    }

### Get image

    http://localhost:3036/api/image?url=https://www.weldyourownapp.com

* `url` (required)
* `format`: `jpeg` (default) or `png`
* `width`: default 800
* `height`: default 450
* `dpr`: deviceScaleFactor, default is 1.0. Note you can use this as a zoom factor; the browser canvas has the same size, but the output image has different size.
* `time`: milliseconds or `networkidle0`


## Implementation

Built on Node.js, Express, Puppeteer, Cheerio, html-metadata.

## Deploying on Vercel

See `vercel.json` – set up as serverless API controllers.

## Older: Deploying on Heroku

Stack: **Heroku-18**

Buildpacks:

  1. https://buildpack-registry.s3.amazonaws.com/buildpacks/jontewks/puppeteer.tgz
  2. heroku/nodejs

### Heroku set-up

  # Set up and configure app
  heroku create MYAPPNAME
  heroku config:set NODE_ENV=production

  # Stack and Buildpacks
  heroku buildpacks:add --index 1 https://buildpack-registry.s3.amazonaws.com/buildpacks/jontewks/puppeteer.tgz
