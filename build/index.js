const webpackCompiler = require('./webpack-compiler')
const debug = require('debug')('app:bin:compile')
const config = require('c0nfig')
const fs = require('fs-extra')

const build = () => {

  debug('Starting compiler Env: ' + config.env)

  const webpackConfig = require(`./${config.env}.webpack.config`)

  return Promise.resolve()
    .then(() => webpackCompiler(webpackConfig))
    .then(stats => {

      if (stats.warnings.length && config.compiler_fail_on_warning) {
        throw new Error('Config set to fail on warning, exiting with status code "1".')
      }

    }).then(() => {

      debug('Compilation completed successfully.')

    }).catch((err) => {

      debug('Compiler encountered an error.', err)
      process.exit(1)
    })
}

build()
