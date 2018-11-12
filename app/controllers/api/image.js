//
// Name:    image.js
// Purpose: Controller and routing for full image
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const puppeteer = require('puppeteer')
// const helpers = require('../helpers')

const fetchImageWithPuppeteer = function (pageUrl, { loadExtraTime, format='jpeg', width=800, height=600 }) {
  console.log(`Fetch image with Puppeteer: "${pageUrl}"`, { loadExtraTime })

  return new Promise(async function (resolve, reject) {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'], ignoreHTTPSErrors: true })

      const page = await browser.newPage()
      await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: false })
      await page.goto(pageUrl)
      await page.waitFor(loadExtraTime)
      const screenshot = await page.screenshot({ type: format, fullPage: false })
      await page.close()
      await browser.close()
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
    loadExtraTime: req.query.time || 100
  }

  console.log(`Get image: "${pageUrl}"`, options)

  fetchImageWithPuppeteer(pageUrl, options)
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
