//
// Name:    page.js
// Purpose: Controller and routing for full page text
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const _ = require('lodash')
const puppeteer = require('puppeteer')

const helpers = require('../../config/helpers')

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
  }
  catch (err) {
    console.error({err}, Object.keys(err))
    const statusCode = 400
    res.status(statusCode).json({ statusCode, message: err.toString() })
  }

}

// Routes

module.exports = function (app, config) {

  const router = express.Router()
  app.use('/', router)

  router.get('/api/page', scrapePuppeteer)

}