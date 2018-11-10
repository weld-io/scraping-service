//
// Name:    meta.js
// Purpose: Controller and routing for metadata
// Creator: Tom Söderlund
//

'use strict'

const express = require('express')
const _ = require('lodash')
const htmlMetadata = require('html-metadata')

const scrapeMetaData = function (req, res, next) {
  const pageUrl = decodeURIComponent(req.query.url)
  const protocol = _.includes(pageUrl, 'https:') ? 'https' : 'http'

  const returnResults = function (url, metadata) {
    const metadataAndUrl = _.merge({}, { url }, metadata)
    res.status(200).json(metadataAndUrl)
  }

  console.log(`Scrape metadata: "${pageUrl}"`)
  htmlMetadata(pageUrl)
    .then(returnResults.bind(undefined, pageUrl))
    .catch(function (getErr) {
      console.error(getErr)
      if (getErr.status === 504 && protocol === 'https') {
        // Change from HTTPS to HTTP
        const httpUrl = pageUrl.replace('https:', 'http:')
        htmlMetadata(httpUrl)
          .then(returnResults.bind(undefined, httpUrl))
          .catch(getErr2 => res.status(getErr2.status || 400).json(getErr2))
      } else {
        res.status(getErr.status || 400).json(getErr)
      }
    })
}

// Routes

module.exports = function (app, config) {
  const router = express.Router()
  app.use('/', router)

  router.get('/api/meta', scrapeMetaData)
}
