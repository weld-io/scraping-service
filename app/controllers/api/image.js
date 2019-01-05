//
// Name:    image.js
// Purpose: Controller and routing for full image
// Creator: Tom Söderlund
//

'use strict'

const { fetchImageWithPuppeteer } = require('../helpers')

const getImage = async function (req, res) {
  try {
    const pageUrl = decodeURIComponent(req.query.url)
    const options = {
      ...req.query,
      width: req.query.width ? parseInt(req.query.width) : undefined,
      height: req.query.height ? parseInt(req.query.height) : undefined,
      loadExtraTime: req.query.time || 0
    }
    // Get image
    const image = await fetchImageWithPuppeteer(pageUrl, options)
    res.setHeader('content-type', 'image/' + (options.format || 'jpeg'))
    res.end(image)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html')
    res.end(`<h1>Server Error</h1><p>Sorry, there was a problem: ${err.message}</p>`)
    console.error(err.message)
  }
}

// Routes

module.exports = getImage
