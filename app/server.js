// Just a test server for development, not used by Now hosting
const { createServer } = require('http')
const PORT = process.env.PORT || 3036
// dom-simple/dom/image/meta/page – See /app/controllers/api folder
const controller = process.env.API || 'dom-simple'
createServer(require(`./controllers/api/${controller}`)).listen(PORT, () => console.log(`scraping-service:${controller} running on http://localhost:${PORT}, NODE_ENV: ${process.env.NODE_ENV}`))
