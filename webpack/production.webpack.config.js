import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import ImageminPlugin from 'imagemin-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import OptimizeJsPlugin from 'optimize-js-plugin'
import BrotliPlugin from 'brotli-webpack-plugin'
import WebpackMd5Hash from 'webpack-md5-hash'
import webpack from 'webpack'
import config from 'c0nfig'
import chalk from 'chalk'
import path from 'path'
import glob from 'glob'

///////////////////////////////////////////////////////////
// Silence deprecation warnings
// (caused by deprecated API used by webpack loaders)
//
///////////////////////////////////////////////////////////
//process.traceDeprecation = true
process.noDeprecation = true

///////////////////////////////////////////////////////////
// Webpack config production
//
///////////////////////////////////////////////////////////
module.exports = {

  devtool: false,

  context: path.join(__dirname, '..'),

  entry: {
    vendor: [
      'react-bootstrap',
      'redux-thunk',
      'react-redux',
      'react-dom',
      'jquery',
      'redux',
      'react',
    ],
    app: [
      path.resolve('./src/client/index.js')
    ]
  },

  output: {
    chunkFilename: "[name].[chunkhash].min.js",
    path: path.resolve(__dirname, '../dist'),
    filename: "[name].[chunkhash].min.js",
    publicPath: '/'
  },

  stats: {
    // Add asset Information
    assets: true,
    // Sort assets by a field
    assetsSort: "field",
    // Add information about cached (not built) modules
    cached: true,
    // Add children information
    children: true,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,
    // Add built modules information to chunk information
    chunkModules: true,
    // Add the origins of chunks and chunk merging info
    chunkOrigins: false,
    // Sort the chunks by a field
    chunksSort: "field",
    // Context directory for request shortening
    context: path.resolve("../src/"),
    // `webpack --colors` equivalent
    colors: true,
    // Add errors
    errors: true,
    // Add details to errors (like resolving log)
    errorDetails: true,
    // Add the hash of the compilation
    hash: false,
    // Add built modules information
    modules: false,
    // Sort the modules by a field
    modulesSort: "field",
    // Add public path information
    publicPath: false,
    // Add information about the reasons why modules are included
    reasons: false,
    // Add the source code of modules
    source: false,
    // Add timing information
    timings: true,
    // Add webpack version information
    version: true,
    // Add warnings
    warnings: false
  },

  plugins: [

    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),

    new webpack.optimize.OccurrenceOrderPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),

    new WebpackMd5Hash(),

    new ManifestPlugin(),

    new InlineManifestWebpackPlugin({
      name: 'webpackManifest'
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        conditionals:  true,
        comparisons:   true,
        screw_ie8:     true,
        sequences:     true,
        dead_code:     true,
        if_return:     true,
        join_vars:     true,
        warnings:      false,
        evaluate:      false,
        unused:        true
      },
      mangle: true,
      output: {
        comments: false
      }
    }),

    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      Promise: 'bluebird',
      jQuery: 'jquery',
      $: 'jquery'
    }),

    new OptimizeJsPlugin({
      sourceMap: false
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        WEBPACK: true
      }
    }),

    new HtmlWebpackPlugin({

      viewer3D: config.forge.viewer.viewer3D,
      style: config.forge.viewer.style,

      template: path.resolve(
        __dirname,
        `../src/client/layouts/${config.layouts.index}`),

      title: 'Forge | RCDB',
      filename: 'index.html',
      minify: {
        removeStyleLinkTypeAttributes: true,
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        html5: true
      },
      inject: 'body'
    }),

    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: false
    }),

    new webpack.NormalModuleReplacementPlugin(/es6-promise$/, 'bluebird'),

    new CompressionPlugin({
      test: /\.js$|\.css$|\.html$/,
      asset: "[path].gz[query]",
      algorithm: "gzip",
      threshold: 10240,
      minRatio: 0.8
    }),

    new BrotliPlugin({
      test: /\.js$|\.css$|\.html$/,
      asset: "[path].br[query]",
      threshold: 10240,
      minRatio: 0.8
    }),

    new ImageminPlugin({
      disable: process.env.OPTIMIZE_IMG !== null,
      externalImages: {
        sources: glob.sync('./resources/img/**/*.png')
      },
      pngquant: {
        quality: '95-100'
      }
    })
  ],

  resolve: {
    modules: [
      path.resolve('./src/client/viewer.components/Viewer.Extensions.Dynamic'),
      path.resolve('./src/client/viewer.components/Viewer.Extensions'),
      path.resolve('./src/client/viewer.components/Viewer.Commands'),
      path.resolve('./src/client/viewer.components'),

      path.resolve('./src/client/components/UIComponents'),
      path.resolve('./src/client/components'),
      path.resolve('./src/client/services'),
      path.resolve('./src/client/styles'),
      path.resolve('./node_modules'),
      path.resolve('./src/client')
    ],
    extensions : ['.js', '.jsx', '.json']
  },

  resolveLoader: {
    modules: ['node_modules']
  },

  module: {

    rules: [

      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env', 'stage-0'],
            plugins: [
              'transform-decorators-legacy',
              'transform-runtime'
            ]
          }
        }]
      },

      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        }]
      },

      {
        test: /\.(sass|scss)$/,
        use: [{
          loader:'style-loader'
        },  {
          loader: 'css-loader'
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        }, {
          loader:'sass-loader'
        }]
      },

      { test: /\.ttf(\?.*)?$/,   loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
      { test: /\.woff2(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
      { test: /\.woff(\?.*)?$/,  loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
      { test: /\.otf(\?.*)?$/,   loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
      { test: /\.svg(\?.*)?$/,   loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
      { test: /\.eot(\?.*)?$/,   loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]' },
      { test: /\.(png|jpg)$/,    loader: 'url-loader?limit=8192' }
    ]
  }
}


