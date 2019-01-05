//
// Name:    image.js
// Purpose: Controller and routing for full image
// Creator: Tom Söderlund
//

'use strict'

const { parseRequestQuery, fetchImageWithPuppeteer } = require('../helpers')

const getImage = async function (req, res) {
  try {
    const query = parseRequestQuery(req.url)
    const pageUrl = decodeURIComponent(query.url)
    const options = {
      ...query,
      width: query.width ? parseInt(query.width) : undefined,
      height: query.height ? parseInt(query.height) : undefined,
      loadExtraTime: query.time || 0
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
