'use strict';

const test = require('tape');
const request = require('supertest');
const async = require('async');

test('Test the entire API', function (assert) {
	const app = require('../app/app');
	async.waterfall([
			(cb) => request(app).get('/api/scrape?url=https://news.ycombinator.com&selector=.title+a').expect(200, cb),
			(results, cb) => { assert.ok(results.body, 'Returned list'); cb(null, results); },
			(results, cb) => { assert.ok(results.body.count > 0, 'More than zero entries'); cb(null, results); },
		],
		(err, results) => {
			assert.end();
		}
	);
});


// https://github.com/substack/tape

/*
test.skip(name, cb)
test.onFinish(fn)
test.only(name, cb)
test.createStream().pipe(process.stdout);
test.createStream({ objectMode: true }).on('data', function (row) { console.log(JSON.stringify(row)) });

t.plan(n)
t.end(err)
t.fail(msg)
t.pass(msg)
t.timeoutAfter(ms)
t.skip(msg)
t.ok(value, msg)
t.notOk(value, msg)
t.error(err, msg)
t.equal(actual, expected, msg)
t.notEqual(actual, expected, msg)
t.deepEqual(actual, expected, msg)
t.notDeepEqual(actual, expected, msg)
t.deepLooseEqual(actual, expected, msg)
t.notDeepLooseEqual(actual, expected, msg)
t.throws(fn, expected, msg)
t.doesNotThrow(fn, expected, msg)
t.test(name, [opts], cb)
t.comment(message)
*/
