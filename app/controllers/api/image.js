//
// Name:    image.js
// Purpose: Controller and routing for full image
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const { browserPool } = require('../helpers')

const fetchImageWithPuppeteer = function (pageUrl, { loadExtraTime, format = 'jpeg', width = 800, height = 600, dpr = 1.0 }) {
  height = height || width
  dpr = parseFloat(dpr)

  console.log(`Fetch image with Puppeteer: "${pageUrl}"`, { loadExtraTime, format, width, height, dpr })

  return new Promise(async function (resolve, reject) {
    try {
      const browser = await browserPool.acquire()
      const page = await browser.newPage()
      await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: false })
      if (['networkidle0'].includes(loadExtraTime)) {
        await page.goto(pageUrl, { waitUntil: loadExtraTime })
      } else {
        await page.goto(pageUrl)
        await page.waitFor(loadExtraTime)
      }
      const screenshot = await page.screenshot({ type: format, fullPage: false })
      await page.close()
      await browserPool.release(browser)
      resolve(screenshot)
    } catch (err) {
      reject(err)
    }
  })
}

const getImage = async function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const options = {
    ...req.query,
    width: req.query.width ? parseInt(req.query.width) : undefined,
    height: req.query.height ? parseInt(req.query.height) : undefined,
    loadExtraTime: req.query.time || 0
  }

  fetchImageWithPuppeteer(pageUrl, options)
    .then(image => {
      res.setHeader('content-type', 'image/' + (options.format || 'jpeg'))
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
