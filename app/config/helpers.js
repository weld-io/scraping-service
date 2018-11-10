'use strict'

var _ = require('lodash')

// Get types for all properties for the arguments object
module.exports.logArguments = function () {
  console.log('logArguments:')
  for (let key in arguments) { console.log(`  ${key}: ${typeof (arguments[key])}`) }
}

// Get types for all properties for the arguments object
module.exports.logProperties = function (obj) {
  console.log('logProperties:')
  for (let key in obj) { console.log(`  ${key}: ${typeof (obj[key])}`) }
}

module.exports.toSlug = function (str, removeInternationalChars) {
  // Abort if not a proper string value
  if (!str || typeof (str) !== 'string') { return str }
  if (removeInternationalChars) {
    return str
      .trim()
      .replace(/ /g, '-') // space to dash
      .replace(/[^\w-]+/g, '') // remove all other characters incl. ÅÄÖ
      .toLowerCase()
  } else {
    return str
      .trim()
      .replace(/ /g, '-') // space to dash
      .replace(/[\t.,?;:‘’“”"'`!@#$€%^&§°*<>()\[\]\{\}_\+=\/\|\\]/g, '') // remove invalid characters
      .replace(/---/g, '-') // fix for the ' - ' case
      .toLowerCase()
  }
}

// [{ reference: foo, ... }, { reference: bar, ... }] -> { foo: ..., bar: ... }
module.exports.arrayToCollection = (array, keyField = 'reference') => _.reduce(array, (collection, obj) => { collection[obj[keyField]] = obj; return collection }, {})
_.mixin({ 'arrayToCollection': module.exports.arrayToCollection })

// applyToAll(func, obj1) or applyToAll(func, [obj1, obj2, ...])
module.exports.applyToAll = (func, objectOrArray) => Array.isArray(objectOrArray) ? _.map(objectOrArray, func) : func(objectOrArray)
_.mixin({ 'applyToAll': module.exports.applyToAll })

// Simple JSON response, usage e.g.
// 1. helpers.sendResponse.bind(res) - err, results will be appended to end
// 2. .find((err, results) => helpers.sendResponse.call(res, err, results))
module.exports.sendResponse = function (err, results, callback) {
  const errorCode = (results === undefined || results === null)
    ? 404
    : (err ? 400 : 200)
  // console.log('sendResponse', errorCode, err, results, typeof(callback));
  if (errorCode !== 200) {
    return this.status(errorCode).send({ error: err, code: errorCode })
  } else {
    if (typeof (callback) === 'function') {
      callback(results)
    } else if (results.toJSON) {
      return this.json(results.toJSON())
    } else {
      return this.json(results)
    }
  }
}

module.exports.sendRequestResponse = function (req, res, next) {
  module.exports.sendResponse.call(res, null, req.crudify.result)
}

module.exports.stripIdsFromRet = function (doc, ret, options) {
  delete ret._id
  delete ret.__v
}
// module.exports.stripIdsFromThis = function (options) {
//  let newObj = this.toObject();
//  delete newObj._id;
//  delete newObj.__v;
//  return newObj;
// }
// const stripIdsFromObject = (options, obj) => module.exports.stripIdsFromThis.call(obj, options);

// module.exports.stripIdsFromResult = function (options, req, res, next) {
//  if (req.crudify.result.length !== undefined) {
//    // Array
//    req.crudify.result = _.map(req.crudify.result, stripIdsFromObject.bind(this, options));
//  }
//  else {
//    // One object
//    req.crudify.result = stripIdsFromObject(options, req.crudify.result);
//  }
//  next();
// };

// E.g. populate user.account with full Account structure
// helpers.populateProperties.bind(this, 'user', 'account')
module.exports.populateProperties = function ({ modelName, propertyName, afterPopulate }, req, res, next) {
  req.crudify[modelName].populate(propertyName, '-_id -__v', next)
}

// From reference to MongoDB _id (or multiple _id's)
// E.g. user.account = 'my-company' --> user.account = '594e6f880ca23b37a4090fe0'
// helpers.changeReferenceToId.bind(this, 'Service', 'reference', 'services')
module.exports.changeReferenceToId = function ({ modelName, parentCollection, childIdentifier }, req, res, next) {
  const modelObj = require('mongoose').model(modelName)
  let searchQuery = {}
  let lookupAction = 'find'
  const parentCollectionType = Object.prototype.toString.call(req.body[parentCollection])
  switch (parentCollectionType) {
    case '[object String]': // One identifier
      searchQuery[childIdentifier] = req.body[parentCollection]
      break
    case '[object Array]': // Array of identifiers
      searchQuery[childIdentifier] = { $in: req.body[parentCollection] }
      break
    case '[object Object]': // Create new child object, e.g. create User and
      lookupAction = 'create'
      searchQuery = req.body[parentCollection]
      break
  }
  // Do the find or create, depending on lookupAction
  modelObj[lookupAction](searchQuery, function (err, results) {
    if (!err) {
      if (results) {
        switch (parentCollectionType) {
          case '[object String]': // One identifier
            req.body[parentCollection] = results[0]._id
            break
          case '[object Array]': // Array of identifiers
            req.body[parentCollection] = _.map(results, '_id')
            break
          case '[object Object]': // Create new child object, e.g. create User and
            req.body[parentCollection] = results._id
            break
        }
      } else {
        res.status(404)
        err = modelName + '(s) not found: ' + req.body[parentCollection]
      }
    }
    next(err, results)
  })
}
