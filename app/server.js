const app = require('./app')
const config = require('./config/config')

const portNumber = process.env.PORT || config.port
console.log('scraping-service running on http://localhost:' + portNumber)
app.listen(portNumber)
