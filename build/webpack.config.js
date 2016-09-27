const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const debug = require('debug')('app:webpack:config')
const clean = require('clean-webpack-plugin')
const config = require('../config')
const webpack = require('webpack')
const cssnano = require('cssnano')
const path = require('path')

const __PROD__ = config.globals.__PROD__
const __TEST__ = config.globals.__TEST__
const __DEV__ = config.globals.__DEV__
const paths = config.utils_paths

debug('Creating configuration.')

const webpackConfig = {
  name    : 'client',
  target  : 'web',
  devtool : config.compiler_devtool,
  resolve : {
    root       : [
      paths.client(),
      path.resolve('./src/client/services'),
      path.resolve('./src/client/components'),
      path.resolve('./src/client/components/utils')
    ],
    extensions : ['', '.js', '.jsx', '.json']
  },
  module : {}
}

// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = paths.client('main.js')

webpackConfig.entry = {
  app : __DEV__
    ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr`)
    : [APP_ENTRY],
  vendor : config.compiler_vendors
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
  filename   : `[name].[${config.compiler_hash_type}].js`,
  path       : paths.dist(),
  publicPath : config.compiler_public_path
}

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [

  new webpack.ProvidePlugin({
    'window.jQuery': 'jquery',
    jQuery: 'jquery',
    $: 'jquery'
  }),
  new webpack.DefinePlugin(config.globals),
]

if (__DEV__) {

  debug('Enable plugins for live development (HMR, NoErrors).')

  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      threeJS: '/resources/libs/viewer/three.js',
      viewer3D: '/resources/libs/viewer/viewer3D.js',
      viewerCSS: '/resources/libs/viewer/style.css',
      template: paths.client('layouts/index.ejs'),
      title: 'Forge | RCDB | DEV',
      filename: 'index.html',
      minify: false,
      inject: 'body'
    }))

  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )

} else if (__PROD__) {

  debug('Enable plugins for production (OccurenceOrder, Dedupe & UglifyJS).')

  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      threeJS: 'https://autodeskviewer.com/viewers/2.10/three.min.js',
      viewer3D: 'https://autodeskviewer.com/viewers/2.10/viewer3D.min.js',
      viewerCSS: 'https://autodeskviewer.com/viewers/2.10/style.min.css',
      template: paths.client('layouts/index.ejs'),
      title: 'Forge | RCDB | DEV',
      filename: 'index.html',
      minify: {
        removeStyleLinkTypeAttributes: true,
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true
      },
      inject: 'body'
    }))

  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        unused    : true,
        dead_code : true,
        warnings  : false
      }
    })
  )
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      names : ['vendor']
    })
  )
}

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON
webpackConfig.module.loaders = [{
  test    : /\.(js|jsx)$/,
  exclude : /node_modules/,
  loader  : 'babel',
  query   : config.compiler_babel
}, {
  test   : /\.json$/,
  loader : 'json'
}]

// ------------------------------------
// Style Loaders
// ------------------------------------
// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css?sourceMap&-minimize'

webpackConfig.module.loaders.push({
  test    : /\.scss$/,
  exclude : null,
  loaders : [
    'style',
    BASE_CSS_LOADER,
    'postcss',
    'sass?sourceMap'
  ]
})
webpackConfig.module.loaders.push({
  test    : /\.css$/,
  exclude : null,
  loaders : [
    'style',
    BASE_CSS_LOADER,
    'postcss'
  ]
})

webpackConfig.sassLoader = {
  includePaths : paths.client('styles')
}

webpackConfig.postcss = [
  cssnano({
    autoprefixer : {
      add      : true,
      remove   : true,
      browsers : ['last 2 versions']
    },
    discardComments : {
      removeAll : true
    },
    discardUnused : false,
    mergeIdents   : false,
    reduceIdents  : false,
    safe          : true,
    sourcemap     : true
  })
]

//var loaders = [
//  { test: /\.less$/, loader: "style!css!less" },
//  { test: /\.css$/, loader: "style-loader!css-loader" },
//  { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
//  { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
//  { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
//  { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
//  { test: /\.(png|jpg)$/,               loader: 'url?limit=8192' }
//]
//
//loaders.forEach(function(loader){
//
//    webpackConfig.module.loaders.push(loader)
//})

// File loaders
/* eslint-disable */
webpackConfig.module.loaders.push(
  { test: /\.woff(\?.*)?$/,  loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
  { test: /\.woff2(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
  { test: /\.otf(\?.*)?$/,   loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
  { test: /\.ttf(\?.*)?$/,   loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
  { test: /\.eot(\?.*)?$/,   loader: 'file?prefix=fonts/&name=[path][name].[ext]' },
  { test: /\.svg(\?.*)?$/,   loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
  { test: /\.(png|jpg)$/,    loader: 'url?limit=8192' }
)
/* eslint-enable */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  debug('Apply ExtractTextPlugin to CSS loaders.')
  webpackConfig.module.loaders.filter((loader) =>
    loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
  ).forEach((loader) => {
    const first = loader.loaders[0]
    const rest = loader.loaders.slice(1)
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
    delete loader.loaders
  })

  webpackConfig.plugins.push(
    new ExtractTextPlugin('[name].[contenthash].css', {
      allChunks : true
    })
  )
}

module.exports = webpackConfig
