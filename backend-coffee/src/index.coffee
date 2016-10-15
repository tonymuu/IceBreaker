# all the tools
express = require 'express'
mongoose = require 'mongoose'
passport = require 'passport'
flash = require 'connect-flash'

morgan = require 'morgan'
cookieParser = require 'cookie-parser'
session = require 'express-session'

# configuration
configDB = require './config/database.js'

path = require 'path'
bodyParser = require 'body-parser'
MongoClient = require('mongodb').MongoClient
Server = require('mongodb').Server
# CollectionDriver = require './CollectionDriver.js'

# set up express app
app = express()
app.set('port', process.env.PORT || 3000)

mongoose.connect(configDB.url)

require('./config/passport')(passport)

app.use morgan 'dev'
app.use cookieParser()
app.use bodyParser()

app.set('view engine', 'ejs')

# set up passport
app.use session { secret: 'smartins' }
app.use passport.initialize()
app.use passport.session()
app.use flash()

# routes
require('./app/routes.js')(app, passport)

app.use express.static path.join __dirname, 'public'

app.listen(process.env.PORT || 3000, ->
  console.log 'Server listening on port 3000...')
