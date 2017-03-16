const webpack = require('webpack')

function webpackCompiler (webpackConfig) {

  return new Promise((resolve, reject) => {

    const compiler = webpack (webpackConfig)

    compiler.run((err, stats) => {

      if (err) {

        console.log('Webpack compiler encountered a fatal error.', err)
        return reject(err)
      }

      const jsonStats = stats.toJson()

      console.log(stats.toString(webpackConfig.stats))

      resolve(jsonStats)
    })
  })
}

module.exports = webpackCompiler
