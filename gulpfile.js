/* jslint node: true */
"use strict";

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');
var inject = require('gulp-inject');
var minifyCSS = require('gulp-minify-css');
var bump = require('gulp-bump');

var pkg = require('./package.json');

var info = {};
info.src = {
	pkg: 'package.json',
	cfml: 'index.cfm',
	js: 'assets/js/app.js',
	css: 'assets/css/main.css'
};

info.dest = {
	cfml: 'index.cfm',
	js: 'assets/js/build',
	css: 'assets/css/build'
};

// Will patch the version
gulp.task('bump', function(){
  gulp.src(info.src.pkg)
  .pipe(bump())
  .pipe(gulp.dest('./'));
});

// Defined method of updating:
// Semantic
gulp.task('bump_minor', function(){
  gulp.src(info.src.pkg)
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('bump_major', function(){
  gulp.src(info.src.pkg)
  .pipe(bump({type:'major'}))
  .pipe(gulp.dest('./'));
});

// Lint Task
gulp.task('lint', function () {
    return gulp.src(info.src.js)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
	var currentDateTime = new Date();
  var headerValue = "/* Gulped: " + currentDateTime + " */\n";
    return gulp.src(info.src.js)
        .pipe(rename(pkg.name + '-' + pkg.version + '.min.js'))
        .pipe(uglify())
		.pipe(header(headerValue))
        .pipe(gulp.dest(info.dest.js));
});

// Clean up CSS
gulp.task('css', function () {
  var currentDateTime = new Date();
  var headerValue = "/* Gulped: " + currentDateTime + " */\n";
    return gulp.src(info.src.css)
        .pipe(rename(pkg.name + '-' + pkg.version + '.min.css'))
        .pipe(minifyCSS())
        .pipe(header(headerValue))
        .pipe(gulp.dest(info.dest.css));
});

// Inject JS and CSS
gulp.task('inject', function() {
    return gulp.src(info.src.cfml)
        .pipe(inject(gulp.src([info.dest.js + "/*.js", info.dest.css + "/*"], { read: false }), {
            addRootSlash: false,
            ignorePath: '/' + info.dest.cfml + '/'
        }))
        .pipe(gulp.dest('./'));
});

// Watch Files For Changes
gulp.task('watch_js', function () {
    gulp.watch(info.src.js, ['lint', 'scripts', 'inject']);
});

// Watch Files For Changes
gulp.task('watch_css', function () {
    gulp.watch(info.src.css, ['css', 'inject']);
});


gulp.task('build', ['lint', 'bump', 'scripts', 'css', 'inject']);
gulp.task('build_minor', ['lint', 'bump_minor', 'scripts', 'css', 'inject']);
gulp.task('build_major', ['lint', 'bump_major', 'scripts', 'css', 'inject']);
gulp.task('default', ['lint', 'scripts', 'css', 'watch_js', 'watch_css']);