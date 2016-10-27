// async support
import 'babel-polyfill'

//Server stuff
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon'
import store from 'connect-mongo'
import express from 'express'
import helmet from 'helmet'
import debug from 'debug'
import util from 'util'
import path from 'path'

//Endpoints
import DerivativesAPI from './api/endpoints/derivatives'
import MaterialAPI from './api/endpoints/materials'
import SocketAPI from './api/endpoints/socket'
import UploadAPI from './api/endpoints/upload'
import ModelAPI from './api/endpoints/models'
import ForgeAPI from './api/endpoints/forge'
import OssAPI from './api/endpoints/oss'

//Falcor API
import FalcorAPI from './api/falcor'

//Services
import DerivativesSvc from './api/services/DerivativesSvc'
import ServiceManager from './api/services/SvcManager'
import MongoDbSvc from './api/services/MongoDbSvc'
import SocketSvc from './api/services/SocketSvc'
import ForgeSvc from './api/services/ForgeSvc'
import ModelSvc from './api/services/ModelSvc'
import OssSvc from './api/services/OssSvc'

//Webpack hot reloading imports
import webpackConfig from '../../build/development.webpack.config'
import webpack from 'webpack'

//Config (NODE_ENV dependant)
import config from'c0nfig'

/////////////////////////////////////////////////////////////////////
// App initialization
//
/////////////////////////////////////////////////////////////////////
const _debug = debug('app:server')
var app = express()

app.set('trust proxy', 1)

if(process.env.NODE_ENV === 'development') {

  app.use(session({
    secret: 'forge-rcdb',
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 24h session
    },
    resave: false,
    saveUninitialized: true
  }))

} else {

  const dbConfig = config.databases[0]

  const MongoStore = store(session)

  app.use(session({
    secret: 'forge-rcdb',
    cookie: {
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 // 24h session
    },
    resave: false,
    saveUninitialized: true,

    store: new MongoStore({
      url: util.format('mongodb://%s:%s@%s:%d/%s',
        dbConfig.user,
        dbConfig.pass,
        dbConfig.dbhost,
        dbConfig.port,
        dbConfig.dbName),
      autoRemove: 'native',  // Default
      autoRemoveInterval: 10 // In minutes. Default
    })
  }))
}

app.use('/resources', express.static(__dirname + '/../../resources'))
app.use(favicon(__dirname + '/../../resources/img/forge.png'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(helmet())

/////////////////////////////////////////////////////////////////////
// API Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/derivatives', DerivativesAPI())
app.use('/api/materials', MaterialAPI())
app.use('/api/socket', SocketAPI())
app.use('/api/upload', UploadAPI())
app.use('/api/models', ModelAPI())
app.use('/api/forge', ForgeAPI())
app.use('/api/oss', OssAPI())

/////////////////////////////////////////////////////////////////////
// Falcor Routes
//
/////////////////////////////////////////////////////////////////////
app.use('/api/falcor/models.json', FalcorAPI.Model)

/////////////////////////////////////////////////////////////////////
// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware
//
/////////////////////////////////////////////////////////////////////
app.use(require('connect-history-api-fallback')())

/////////////////////////////////////////////////////////////////////
// Static routes
//
/////////////////////////////////////////////////////////////////////
if (config.env === 'development') {

  // Apply Webpack HMR Middleware

  const compiler = webpack(webpackConfig)

  _debug('Enable webpack dev and HMR middleware')

  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    contentBase : config.utils_paths.client(),
    hot         : true,
    quiet       : config.compiler_quiet,
    noInfo      : config.compiler_quiet,
    lazy        : false,
    stats       : config.compiler_stats
  }))

  app.use(require('webpack-hot-middleware')(compiler))

} else {

  app.use('/', express.static(config.utils_paths.dist()))
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
function runServer(app) {

  try {

    process.on('exit', () => {

    })

    process.on('uncaughtException', (err) => {

      console.log('uncaughtException')
      console.log(err)
      console.error(err.stack)
    })

    process.on('unhandledRejection', (reason, p) => {

      console.log('Unhandled Rejection at: Promise ', p,
        ' reason: ', reason)
    })

    var derivativesSvc = new DerivativesSvc()

    var forgeSvc = new ForgeSvc(
      config.forge)

    var ossSvc = new OssSvc()

    ServiceManager.registerService(derivativesSvc)
    ServiceManager.registerService(forgeSvc)
    ServiceManager.registerService(ossSvc)

    config.databases.forEach((dbConfig) => {

      switch (dbConfig.type) {

        case 'mongo':

          let dbSvc = new MongoDbSvc(dbConfig)

          dbSvc.connect().then(() => {

            let modelSvc = new ModelSvc(dbConfig)

            ServiceManager.registerService(modelSvc)
            ServiceManager.registerService(dbSvc)
          })

          break;
      }
    })

    var server = app.listen(
      process.env.PORT || config.server_port || 3000, () => {

        var socketSvc = new SocketSvc({
          session,
          server
        })

        ServiceManager.registerService(socketSvc)

        console.log('Server listening on: ')
        console.log(server.address())
        console.log('ENV: ' + process.env.NODE_ENV)
      })

  } catch (ex) {

    console.log('Failed to run server... ')
    console.log(ex)
  }
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
runServer(app)

