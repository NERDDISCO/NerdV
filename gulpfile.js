'use strict';

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon')
;





/*
 * Paths
 */
var path = {
  root_src : 'src/',
  root_public : 'public/',
  root_tmp : 'tmp/'
};

// JavaScript paths
path.js = {

  app : './app/*',

};





/*
 * nodemon
 */
gulp.task('nodemon', function () {
  nodemon(require('./nodemon.json'))
    .once('quit', function () {
    });
});





/*
 * Default
 *
 * - start the server using nodemon
 * - start watching of file changes
 */
gulp.task('default', [ 'nodemon' ]);
