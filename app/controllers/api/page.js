//
// Name:    page.js
// Purpose: Controller and routing for full page text
// Creator: Tom Söderlund
//

'use strict'

const { fetchPageWithPuppeteer } = require('../helpers')

const scrapePageContent = async function (req, res) {
  try {
    const pageUrl = decodeURIComponent(req.query.url)
    const loadExtraTime = req.query.time || 1000
    const bodyOnly = req.query.bodyOnly

    console.log(`Scrape text: "${pageUrl}", ${loadExtraTime} ms`)

    const documentHTML = await fetchPageWithPuppeteer(pageUrl, { loadExtraTime, bodyOnly })
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      url: pageUrl,
      length: documentHTML.length,
      content: documentHTML
    }))
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ code: res.statusCode, message: err.message }))
    console.error(err.message)
  }
}

module.exports = scrapePageContent
