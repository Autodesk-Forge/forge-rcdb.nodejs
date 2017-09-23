const path = require('path')
const fs = require('fs')

if (process.env.NODE_ENV === 'production') {

  const dist = path.resolve(__dirname, '../dist')

  fs.stat(dist, (err, stats) => {
    if (err) {
      console.log('dist/ directory not found, starting compiler ...')
      require('../webpack')
    }
  })

  require('./static')

} else {

  require('babel-core/register')({
    plugins: ['transform-decorators-legacy'],
    presets: ['env', 'stage-0']
  })

  require('../src/server')
}
