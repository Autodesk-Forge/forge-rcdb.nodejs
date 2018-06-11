import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import webpack from 'webpack'
import rimraf from'rimraf'
import path from 'path'
import 'babel-polyfill'
import fs from 'fs'

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

      console.log('Cleaning directory:' + dir)

      rimraf(dir, (delErr) => {

        if (delErr) {

          console.log(`Error deleting ${dir}:`, delErr)
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
const build = (env) => {

  return new Promise((resolve, reject) => {

    const webpackConfig = require(`./${env}.webpack.config`)

    if (process.env.ANALYZE_BUNDLE) {

      webpackConfig.plugins.push(new BundleAnalyzerPlugin())
    }

    const compiler = webpack (webpackConfig)

    compiler.run((err, stats) => {

      return err
        ? reject (err)
        : resolve(stats.toString(webpackConfig.stats))
    })
  })
}

///////////////////////////////////////////////////////////
// Clean + Build
//
///////////////////////////////////////////////////////////
const runCompiler = async () => {

  try {

    if (!process.env.HOT_RELOADING) {

      const dir = path.resolve(__dirname, '../dist')

      await clean(dir)
    }

    const env = process.env.WEBPACK_ENV || process.env.NODE_ENV

    console.log('Starting compiler NODE_ENV=' + env)

    const stats = await build (env)

    console.log(stats)

  } catch (ex) {

    console.log('build error:', ex)
  }
}

///////////////////////////////////////////////////////////
// Do it
//
///////////////////////////////////////////////////////////
runCompiler()
