'use strict'

const test = require('tape')
const request = require('supertest')
const async = require('async')

test('Test /api/dom', function (assert) {
  const app = require('../app/app')
  async.waterfall([
    (cb) => request(app).get('/api/dom?url=https://news.ycombinator.com&selector=.title+a').expect(200, cb),
    (results, cb) => { assert.ok(results.body, 'Returned list'); cb(null, results) },
    (results, cb) => { assert.ok(results.body.results[0].count > 0, '1+ items returned'); cb(null, results) }
  ],
  (err, results) => {
    assert.end()
  }
  )
})

test('Test /api/metadata', function (assert) {
  const app = require('../app/app')
  async.waterfall([
    (cb) => request(app).get('/api/meta?url=https://www.weld.io').expect(200, cb),
    (results, cb) => { assert.ok(results.body, 'Returned results'); cb(null, results) },
    (results, cb) => { assert.ok(results.body.general.title.indexOf('Weld') !== -1, 'Page <title> contains “Weld”'); cb(null, results) }
  ],
  (err, results) => {
    assert.end()
  }
  )
})

test('Test /api/page', function (assert) {
  const app = require('../app/app')
  async.waterfall([
    (cb) => request(app).get('/api/page?url=http://www.tomsoderlund.com').expect(200, cb),
    (results, cb) => { assert.ok(results.body, 'Returned results'); cb(null, results) },
    (results, cb) => { assert.ok(results.body.length > 12000, 'Page size is more than 12000 characters'); cb(null, results) },
    (results, cb) => { assert.ok(results.body.content.indexOf('Tom Söderlund\'s website') !== -1, 'Page content contains “Tom Söderlund\'s website”'); cb(null, results) }
  ],
  (err, results) => {
    assert.end()
  }
  )
})

// https://github.com/substack/tape

/*
test.skip(name, cb)
test.onFinish(fn)
test.only(name, cb)
test.createStream().pipe(process.stdout);
test.createStream({ objectMode: true }).on('data', function (row) { console.log(JSON.stringify(row)) });

assert.plan(n)
assert.end(err)
assert.fail(msg)
assert.pass(msg)
assert.timeoutAfter(ms)
assert.skip(msg)
assert.ok(value, msg)
assert.notOk(value, msg)
assert.error(err, msg)
assert.equal(actual, expected, msg)
assert.notEqual(actual, expected, msg)
assert.deepEqual(actual, expected, msg)
assert.notDeepEqual(actual, expected, msg)
assert.deepLooseEqual(actual, expected, msg)
assert.notDeepLooseEqual(actual, expected, msg)
assert.throws(fn, expected, msg)
assert.doesNotThrow(fn, expected, msg)
assert.test(name, [opts], cb)
assert.comment(message)
*/
