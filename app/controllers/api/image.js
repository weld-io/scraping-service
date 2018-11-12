//
// Name:    image.js
// Purpose: Controller and routing for full image
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const puppeteer = require('puppeteer')
// const helpers = require('../helpers')

const fetchImageWithPuppeteer = function (pageUrl, { loadExtraTime }) {
  console.log(`Fetch image with Puppeteer: "${pageUrl}"`, { loadExtraTime })

  return new Promise(async function (resolve, reject) {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'], ignoreHTTPSErrors: true })

      const page = await browser.newPage()
      await page.setViewport({ width: 300, height: 300 })
      await page.goto(pageUrl)
      await page.waitFor(loadExtraTime)
      page.screenshot({ path: 'image.png', fullPage: false })
        .then(screenshot => resolve(screenshot))
        .catch(err => reject(err))
      await page.close()
      await browser.close()
    } catch (err) {
      reject(err)
    }
  })
}

const getImage = async function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const loadExtraTime = req.query.time || 1000

  console.log(`Scrape text: "${pageUrl}", ${loadExtraTime} ms`)

  fetchImageWithPuppeteer(pageUrl, { loadExtraTime })
    .then(image => {
      res.setHeader('content-type', 'image/png')
      res.send(image)
    })
    .catch(err => {
      console.error({ err }, Object.keys(err))
      const statusCode = 400
      res.status(statusCode).json({ statusCode, message: err.toString() })
    })
}

// Routes

module.exports = function (app, config) {
  const router = express.Router()
  app.use('/', router)

  router.get('/api/image', getImage)
}
