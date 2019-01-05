const glob = require('glob')
const logger = require('morgan')
const bodyParser = require('body-parser')
const compress = require('compression')
// const cookieParser = require('cookie-parser');
// const methodOverride = require('method-override');
const cors = require('cors')

module.exports = function (app, config) {
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))
  app.use(compress())
  // app.use(cookieParser());
  // app.use(methodOverride());
  app.use(cors())

  // Routing

  // // Require in Auth controller
  // const authController = require(config.root + '/controllers/auth');
  // authController(app, config);

  // Require in all API controllers
  glob.sync(config.root + '/controllers/api/*.js').forEach(controllerPath => require(controllerPath)(app, config))

  // If no matching route found -> 404
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })

  if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
      res.status(err.status || 500)
      res.end({
        message: err.message,
        error: err,
        title: 'error'
      })
    })
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.end({
      message: err.message,
      error: {},
      title: 'error'
    })
  })
}
