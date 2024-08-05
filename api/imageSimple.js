'use strict'

const { createReadStream, createWriteStream, unlink } = require('fs')
const { promisify } = require('util')
const { pipeline } = require('stream')
const { resolve } = require('path')
const { tmpdir } = require('os')
const { randomBytes } = require('crypto')

const streamPipeline = promisify(pipeline)

const getCachedImage = async function (req, res) {
  try {
    const fetch = (await import('node-fetch')).default;
    const requestUrl = new URL(req.url, `http://${req.headers.host}`)
    const imageUrl = requestUrl.searchParams.get('url')
    if (!imageUrl) throw new Error('No "url" specified')

    const decodedImageUrl = decodeURIComponent(imageUrl)

    // Generate a unique filename for the cached image
    const randomFileName = randomBytes(16).toString('hex')
    const tempFilePath = resolve(tmpdir(), randomFileName)

    // Download the image and save it to the temporary file
    const response = await fetch(decodedImageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)

    await streamPipeline(response.body, createWriteStream(tempFilePath))

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

    // Stream the cached image file back to the client
    const readStream = createReadStream(tempFilePath)
    readStream.pipe(res)

    readStream.on('end', () => {
      // Clean up the temporary file after serving it
      unlink(tempFilePath, (err) => {
        if (err) console.error(`Failed to delete temporary file: ${tempFilePath}`)
      })
    })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = getCachedImage