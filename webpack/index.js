const webpackCompiler = require('./webpack-compiler')
const rimraf = require('rimraf')
const path = require('path')
const fs = require('fs')

///////////////////////////////////////////////////////////
// Clean a directory
//
///////////////////////////////////////////////////////////
const clean = (dir) => {

  return new Promise ((resolve) => {

    fs.stat(dir, (fsErr, stats) => {

      if (fsErr) {
        return resolve()
      }

      rimraf(dir, (delErr) => {

        if (delErr) {
          console.log('Error deleting ' + dir)
          console.log(delErr)
        }
        resolve()
      })
    })
  })
}

///////////////////////////////////////////////////////////
// Run Webpack compiler
//
///////////////////////////////////////////////////////////
const build = () => {

  const env = process.env.NODE_ENV

  console.log('Starting compiler NODE_ENV=' + env)

  const webpackConfig = require(`./${env}.webpack.config`)

  return webpackCompiler(webpackConfig).then(() => {

    console.log('Compilation completed successfully.')

  }).catch((err) => {

    console.log('Compiler encountered an error.', err)
    process.exit(1)
  })
}

///////////////////////////////////////////////////////////
// Clean + Build
//
///////////////////////////////////////////////////////////
clean(path.resolve(__dirname, '../dist')).then(() => {

  build()
})

