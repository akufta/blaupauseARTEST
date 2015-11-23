/**
 * scripts.js
 * @name - 'scripts'
 * @task - Compiles & uglifies AMD modules
 */

'use strict';

const argv = require('yargs').boolean('p').argv;
const gulp = require('gulp');
const gulpif = require('gulp-if');
const named = require('vinyl-named');
const pack = require('webpack'); // Reference for plugins
const reload = require('browser-sync').reload;
const size = require('gulp-size');
const webpack = require('webpack-stream');
const config = require('../config').scripts;

const isProduction = argv.p;
const pluginArray = [new pack.optimize.DedupePlugin()];

if (isProduction) {
  pluginArray.push(new pack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }));

  pluginArray.push(new pack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
    },
  }));
}

gulp.task('scripts', function buildScripts() {
  return gulp.src(config.bundles)
    .pipe(named())
    .pipe(webpack({
      cache: true,
      devtool: !isProduction ? '#source-map' : false,
      externals: config.externals,
      module: {
        loaders: [
          {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
              presets: ['es2015', 'react'],
            },
          },
        ],
      },
      plugins: pluginArray,
      quiet: isProduction,
    }))
    .pipe(gulp.dest(config.dest))
    .pipe(gulpif(isProduction, size({
      gzip: true,
      showFiles: true,
      title: 'JS:',
    })))
    .pipe(reload({ stream: true }));
});
