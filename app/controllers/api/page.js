//
// Name:    page.js
// Purpose: Controller and routing for full page text
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const puppeteer = require('puppeteer')

const scrapePuppeteer = async function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const loadExtraTime = req.query.time || 1000

  console.log(`Scrape text: "${pageUrl}", ${loadExtraTime} ms`)

  try {
    const browser = await puppeteer.launch()

    const page = await browser.newPage()
    await page.goto(pageUrl)
    await page.waitFor(loadExtraTime)

    // await page.content(), document.body.innerHTML, document.documentElement.outerHTML
    const documentHTML = await page.evaluate(() => document.documentElement.outerHTML)

    await browser.close()

    res.json({
      url: pageUrl,
      length: documentHTML.length,
      content: documentHTML
    })
  } catch (err) {
    console.error({ err }, Object.keys(err))
    const statusCode = 400
    res.status(statusCode).json({ statusCode, message: err.toString() })
  }
}

const scrapeChrome = function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const loadExtraTime = req.query.time || 100
  const domElement = req.query.bodyOnly ? 'document.body.outerHTML' : 'document.documentElement.outerHTML'

  console.log(`Scrape: "${pageUrl}", ${loadExtraTime} ms`)

  const CDP = require('chrome-remote-interface')
  CDP((client) => {
    // Extract used DevTools domains.
    const { Page, Runtime } = client

    // Enable events on domains we are interested in.
    Promise.all([
      Page.enable()
    ]).then(() => {
      return Page.navigate({ url: pageUrl })
    })

    // Evaluate outerHTML after page has loaded.
    Page.loadEventFired(() => {
      setTimeout(() => {
        Runtime.evaluate({ expression: domElement }).then(response => {
          client.close()
          res.json({
            url: pageUrl,
            length: response.result.value.length,
            content: response.result.value
          })
        })
      }, loadExtraTime) // extra time before accessing DOM
    })
  }).on('error', (err) => {
    console.error('Cannot connect to browser:', err)
    const statusCode = 400
    res.status(statusCode).json({ statusCode, message: err.toString() })
  })
}

// Routes

module.exports = function (app, config) {
  const router = express.Router()
  app.use('/', router)

  // router.get('/api/page', scrapePuppeteer)
  router.get('/api/page', scrapeChrome)
}
