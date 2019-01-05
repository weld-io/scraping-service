const { createServer } = require('http')
const PORT = process.env.PORT || 3036
const controller = 'dom' // See /app/controllers/api folder
createServer(require(`./controllers/api/${controller}`)).listen(PORT, () => console.log(`scraping-service running on http://localhost:${PORT}`))
