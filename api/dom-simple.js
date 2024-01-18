//
// Name:    dom-simple.js
// Purpose: Controller for pure-fetch (no-Puppeteer) scraping
// Creator: Tom Söderlund
//

'use strict'

const fetch = require('node-fetch')
const { parseRequestQuery, parseDOM } = require('../lib/helpers')

const scrapePage = async function (req, res) {
  try {
    const query = parseRequestQuery(req.url)
    if (!query.url) throw new Error(`No "url" specified: ${req.url}`)
    const pageUrl = decodeURIComponent(query.url)
    // Use $ instead of # to allow for easier URL parsing
    const pageSelector = decodeURIComponent(query.selector || 'body').replace(/\$/g, '#')
    const loadExtraTime = query.time || 3000
    const deepResults = query.deep || false
    const completeResults = query.complete || false
    const timeStart = Date.now()

    console.log(`Scrape DOM (simple): "${pageUrl}"`, { pageSelector, loadExtraTime })

    const documentResponse = await fetch(pageUrl)
    const documentHTML = await documentResponse.text()
    const selectorsArray = pageSelector.split(',')
    const resultsObj = selectorsArray.map(selector => {
      const items = parseDOM(documentHTML, selector, completeResults, deepResults)
      return { selector, count: items.length, items }
    })
    const timeFinish = Date.now()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ time: (timeFinish - timeStart), results: resultsObj }))
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: res.statusCode, message: err.message }))
    console.error(err.message)
  }
}

// Routes

module.exports = scrapePage
