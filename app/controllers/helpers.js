//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict'

const chrome = require('chrome-aws-lambda')
const puppeteer = process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer')

const parseRequestParams = url => (url.split('?')[0] || '/').substr(1).split('/')

const parseRequestQuery = url => (url.split('?')[1] || '')
  .split('&')
  .reduce((result, propValue) => {
    const key = propValue.split('=')[0]
    if (key) result[key] = propValue.split('=')[1]
    return result
  }, {})

const fetchPageWithPuppeteer = async function (pageUrl, { loadExtraTime, bodyOnly }) {
  console.log(`Fetch page with Puppeteer: "${pageUrl}"`, { loadExtraTime, bodyOnly })

  let browser
  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless
    })
  }
  else {
    browser = await puppeteer.launch({ args: [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-setuid-sandbox',
      '--headless',
      '--no-sandbox',
      '--single-process'
    ],
    ignoreHTTPSErrors: true })
  }

  const page = await browser.newPage()

  if (['networkidle0'].includes(loadExtraTime)) {
    await page.goto(pageUrl, { waitUntil: loadExtraTime })
  } else {
    await page.goto(pageUrl)
    await page.waitFor(parseInt((loadExtraTime)))
  }

  // await page.content(), document.body.innerHTML, document.documentElement.outerHTML
  const documentHTML = bodyOnly
    ? await page.evaluate(() => document.body.outerHTML)
    : await page.evaluate(() => document.documentElement.outerHTML)

  await browser.close()
  return documentHTML
}

const fetchImageWithPuppeteer = async function (pageUrl, { loadExtraTime, format = 'jpeg', width = 800, height = 600, dpr = 1.0 }) {
  height = height || width
  dpr = parseFloat(dpr)

  console.log(`Fetch image with Puppeteer: "${pageUrl}"`, { loadExtraTime, format, width, height, dpr })

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless
  })
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: false })
  if (['networkidle0'].includes(loadExtraTime)) {
    await page.goto(pageUrl, { waitUntil: loadExtraTime })
  } else {
    // Wait milliseconds
    await page.goto(pageUrl)
    await page.waitFor(parseInt((loadExtraTime)))
  }
  const screenshot = await page.screenshot({ type: format, fullPage: false })
  await browser.close()

  return screenshot
}

// Public API

module.exports = {

  parseRequestParams,
  parseRequestQuery,

  fetchPageWithPuppeteer,
  fetchImageWithPuppeteer

}
