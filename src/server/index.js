// async support
import 'babel-polyfill'

//Server stuff
import cookieParser from 'cookie-parser'
import compression from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import store from 'connect-mongo'
import express from 'express'
import helmet from 'helmet'
import debug from 'debug'
import util from 'util'
import path from 'path'

//Endpoints
import MaterialAPI from './api/endpoints/materials'
import LMVProxy from './api/endpoints/lmv-proxy'
import SocketAPI from './api/endpoints/socket'
import ConfigAPI from './api/endpoints/config'
import ModelAPI from './api/endpoints/models'
import ForgeAPI from './api/endpoints/forge'
import MetaAPI from './api/endpoints/meta'

//Services
import DerivativesSvc from './api/services/DerivativesSvc'
import ServiceManager from './api/services/SvcManager'
import MongoDbSvc from './api/services/MongoDbSvc'
import SocketSvc from './api/services/SocketSvc'
import UploadSvc from './api/services/UploadSvc'
import ForgeSvc from './api/services/ForgeSvc'
import ModelSvc from './api/services/ModelSvc'
import OssSvc from './api/services/OssSvc'

//Config (NODE_ENV dependant)
import config from'c0nfig'

/////////////////////////////////////////////////////////////////////
// App initialization
//
/////////////////////////////////////////////////////////////////////
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
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(helmet())

/////////////////////////////////////////////////////////////////////
// Services setup
//
/////////////////////////////////////////////////////////////////////
const derivativesSvc = new DerivativesSvc()

const forgeSvc = new ForgeSvc(
  config.forge)

const uploadSvc = new UploadSvc({
  tempStorage: path.join(__dirname, '/../../TMP')
})

const ossSvc = new OssSvc()

ServiceManager.registerService(derivativesSvc)
ServiceManager.registerService(uploadSvc)
ServiceManager.registerService(forgeSvc)
ServiceManager.registerService(ossSvc)

/////////////////////////////////////////////////////////////////////
// API Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/materials', MaterialAPI())
app.use('/api/socket',    SocketAPI())
app.use('/api/config',    ConfigAPI())
app.use('/api/models',    ModelAPI())
app.use('/api/forge',     ForgeAPI())
app.use('/api/meta',      MetaAPI())

/////////////////////////////////////////////////////////////////////
// Viewer GET Proxy
//
/////////////////////////////////////////////////////////////////////
app.get('/lmv-proxy/*', LMVProxy.get)

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
if (process.env.NODE_ENV === 'development') {

  // dynamically require webpack dependencies
  // to keep them in devDependencies (package.json)
  const webpackConfig = require('../../webpack/development.webpack.config')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpack = require('webpack')

  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: webpackConfig.stats,
    progress: true,
    hot: true
  }))

  app.use(webpackHotMiddleware(compiler))

} else {

  // compression middleware compresses your server responses
  // which makes them smaller (applies also to assets).
  // You can read more about that technique and other good
  // practices on official Express.js docs http://mxs.is/googmy
  app.use(compression())

  app.use(express.static(path.resolve(process.cwd(), './dist')))
}

app.get('*', express.static(path.resolve(process.cwd(), './dist')))

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
const runServer = (app) => {

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

    config.databases.forEach((dbConfig) => {

      switch (dbConfig.type) {

        case 'mongo':

          const dbSvc = new MongoDbSvc(dbConfig)

          dbSvc.connect().then( () => {

            for (const key in dbConfig.collections) {

              const collectionCfg = Object.assign(
                dbConfig.collections[key], {
                  dbName: dbConfig.dbName,
                  name: key
                })

              const modelSvc = new ModelSvc (collectionCfg)

              ServiceManager.registerService(modelSvc)
            }

            ServiceManager.registerService(dbSvc)
          })

          break;
      }
    })

    const server = app.listen(
      process.env.PORT || config.server_port || 3000, () => {

        const socketSvc = new SocketSvc({
          session,
          server
        })

        ServiceManager.registerService(socketSvc)

        const port = server.address().port

        console.log('Server listening on PORT: ' + port)
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

