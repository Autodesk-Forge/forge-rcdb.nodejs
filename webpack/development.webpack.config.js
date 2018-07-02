import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import config from 'c0nfig'
import chalk from 'chalk'
import path from 'path'

///////////////////////////////////////////////////////////
// Silence deprecation warnings
// (caused by deprecated API used by webpack loaders)
//
///////////////////////////////////////////////////////////
//process.traceDeprecation = true
process.noDeprecation = true

///////////////////////////////////////////////////////////
// Webpack config development
//
///////////////////////////////////////////////////////////
module.exports = {

  devtool: 'source-map',

  context: path.join(__dirname, '..'),

  entry: {
    bundle: [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      path.resolve('./src/client/index.js')
    ]
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: "[name].js",
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

    new webpack.HotModuleReplacementPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        WEBPACK: true
      }
    }),

    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      Promise: 'bluebird',
      jQuery: 'jquery',
      $: 'jquery'
    }),

    new HtmlWebpackPlugin({

      viewer3D: config.forge.viewer.viewer3D,
      style: config.forge.viewer.style,

      template: path.resolve(
        __dirname,
        `../src/client/layouts/${config.layouts.index}`),

      title: 'Forge | RCDB | DEV',
      filename: 'index.html',
      minify: false,
      inject: 'body'
    }),

    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: false
    }),

    new webpack.NormalModuleReplacementPlugin(/es6-promise$/, 'bluebird')
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
              'react-hot-loader/babel',
              'transform-runtime'
            ],
            cacheDirectory: true
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
        test: /\.(sass|scss|less)$/,
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
