var path = require('path')
var fs = require('fs')

require('babel-core/register')({
  presets: ['es2015-node5', 'stage-0']
})

if (process.env.NODE_ENV !== 'development') {

  const dist = path.resolve(__dirname, '../dist')

  fs.stat(dist, (err, stats) => {
    if (err) {
      console.log('dist/ directory not found, starting compiler ...')
      require('../webpack')
    }
  })
}

require('../src/server')
