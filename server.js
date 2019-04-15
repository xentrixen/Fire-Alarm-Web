let express = require('express')
let history = require('connect-history-api-fallback')
let path = require('path')
let serveStatic = require('serve-static')

let app = express()

app.use(history({verbose: true}))
app.use(serveStatic(path.join(__dirname, '/dist')))

let port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server started at port ${port}`)
})