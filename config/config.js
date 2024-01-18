const path = require('path')
const rootPath = path.join(__dirname, '/..')
const env = process.env.NODE_ENV || 'development'

const config = {

  development: {
    root: rootPath,
    app: {
      name: 'scraping-service'
    },
    port: 3036
  },

  test: {
    root: rootPath,
    app: {
      name: 'scraping-service'
    },
    port: 3000
  },

  production: {
    root: rootPath,
    app: {
      name: 'scraping-service'
    },
    port: 3000
  }

}

module.exports = config[env]
