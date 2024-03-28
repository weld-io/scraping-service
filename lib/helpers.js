//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict'

const chromium = require('@sparticuz/chromium')
const puppeteer = process.env.NODE_ENV === 'production' ? require('puppeteer-core') : require('puppeteer')
const cheerio = require('cheerio')
const { get, compact } = require('lodash')

const parseRequestParams = url => (url.split('?')[0] || '/').substr(1).split('/')

const parseRequestQuery = url => (url.split('?')[1] || '')
  .split('&')
  .reduce((result, propValue) => {
    const key = propValue.split('=')[0]
    if (key) result[key] = propValue.split('=')[1]
    return result
  }, {})

const compactString = str => str.replace(/[\n\t]/g, '').replace(/\s+/g, ' ').trim()

/**
 * Parses the given DOM string and extracts information based on the provided options.
 *
 * @param {string} domString - The DOM string to parse.
 * @param {string} pageSel - The selector to filter the elements to be parsed.
 * @param {boolean} complete - Whether to return complete DOM nodes as strings.
 * @param {boolean} deep - Whether to traverse the DOM tree deeply and return nested objects.
 * @param {boolean} useIndex - Whether element index instead of class/id.
 * @returns {Array|string|Object} - The parsed result based on the provided options.
 */
const parseDOM = (domString, pageSel, complete = false, deep = false, useIndex = false) => {
  // Use _ instead of . and $ instead of # to allow for easier JavaScript parsing
  const getElementReference = ($element, index = 0) => {
    if (useIndex) {
      return `${$element[0].name}_${index}`
    } else {
      return $element[0].name
        + ($element.attr('class') ? '_' + $element.attr('class').replace(/ /g, '_') : '')
        + ($element.attr('id') ? '$' + $element.attr('id') : '')
    }
  }

  const traverseChildren = function (parentObj, obj, index, elem) {
    const $node = $(elem)
    const nodeRef = getElementReference($node, index)
    // Has children and is not a text node
    if (deep || ($node.children().length > 0 && typeof (obj[nodeRef]) !== 'string')) {
      obj[nodeRef] = obj[nodeRef] || {}
      // Attributes
      obj[nodeRef].attributes = ['href', 'src'].reduce((result, attr) => {
        if ($node.attr(attr)) result[attr] = $node.attr(attr)
        return result
      }, {})
      if (Object.keys(obj[nodeRef].attributes).length === 0) delete obj[nodeRef].attributes
      // Has children AND text: use '.$text='
      if ($node.text().length > 0) {
        obj[nodeRef].$text = compactString($node.text())
      }
      // Traverse the children
      $node.children().each(traverseChildren.bind(undefined, obj, obj[nodeRef]))
    } else {
      // Has only text
      obj[nodeRef] = compactString($node.text())
    }
    // Delete parent.$text if same as this
    if ($node.text() === get(parentObj, '$text')) {
      delete parentObj.$text
    }
  }

  const $ = cheerio.load(domString)
  const resultArray = $(pageSel).map(function (i, el) {
    // this === el
    if (complete) {
      // Complete DOM nodes
      return compactString($(this).toString())
    } else if (deep) {
      // Deep objects
      let deepObj = {}
      traverseChildren(undefined, deepObj, undefined, this)
      return deepObj
    } else {
      // Shallow text
      return compactString($(this).text())
    }
  }).get()
  return compact(resultArray)
}

const fetchPageWithPuppeteer = async function (pageUrl, { waitForSelector, loadExtraTime, bodyOnly }) {
  console.log(`Fetch page with Puppeteer: "${pageUrl}"`, { waitForSelector, loadExtraTime, bodyOnly })

  let browser
  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: 'new',
      ignoreHTTPSErrors: true
    })
  } else {
    browser = await puppeteer.launch({
      args: [
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-setuid-sandbox',
        '--headless',
        '--no-sandbox',
        '--single-process'
      ],
      ignoreHTTPSErrors: true
    })
  }

  const page = await browser.newPage()

  if (waitForSelector !== undefined) {
    await page.goto(pageUrl)
    await page.waitForSelector(waitForSelector)
  } else if (['networkidle0'].includes(loadExtraTime)) {
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

const fetchImageWithPuppeteer = async function (pageUrl, { loadExtraTime, format = 'jpeg', width = 800, height = 450, dpr = 1.0 }) {
  height = height || width
  dpr = parseFloat(dpr)

  console.log(`Fetch image with Puppeteer: "${pageUrl}"`, { loadExtraTime, format, width, height, dpr })

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
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

  parseDOM,

  fetchPageWithPuppeteer,
  fetchImageWithPuppeteer

}
