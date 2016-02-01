"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify'); // Bundles JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX
var csso = require('gulp-csso');//minify css
var jsmin = require('gulp-jsmin');//minify js
var cssnano = require('gulp-cssnano');

var reactify = require('reactify');  // Transforms React JSX to JS

var rename = require("gulp-rename");

var gulpIf = require('gulp-if');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');



var config = {
	port: 9005,
	devBaseUrl: 'http://localhost',
	paths: {
		PRODUCTION_ROOT:'./dist/',
		html: './src/*.html',
		js: './src/js/*.js',
		css: [
      		'./dist/css/bundle.css', // all css files in this bundle
      		'./src/css/style.css', // my css
    	],
		dist: './dist',
		mainJs: [
			'./src/js/custom.js', // custom js
		],
	}
};




//Start a local development server
gulp.task('connect', function() {
	connect.server({
		// root: ['dist'],
		root: ['src'],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	});
});

gulp.task('open', ['connect'], function() {
	gulp.src('dist/index.html')
		.pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});



gulp.task('html', function() {
	gulp.src(config.paths.html)
		.pipe(gulp.dest(config.paths.dist))
		.pipe(connect.reload());
});

gulp.task('js', function() {
	browserify(config.paths.mainJs)
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('main.min.js'))
		.pipe(gulp.dest(config.paths.dist + '/scripts'))
		.pipe(connect.reload());


});

gulp.task('css', function() {
	gulp.src(config.paths.css)
        .pipe(csso())
		.pipe(concat('styles.min.css'))
		.pipe(gulp.dest(config.paths.dist + '/css'))
		.pipe(connect.reload());

    return gulp.src(config.paths.PRODUCTION_ROOT+'css/*.css')
        .pipe(gulp.dest(config.paths.PRODUCTION_ROOT+'css/'))
		.pipe(connect.reload());

});

//this connect all css and js files in one
gulp.task('minifyFiles', function(){
  return gulp.src(config.paths.html)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))

    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))


    .pipe(gulp.dest(config.paths.PRODUCTION_ROOT));
});



gulp.task('minjs', function () {
  gulp.src(config.paths.PRODUCTION_ROOT+'scripts/*.js')
    .pipe(jsmin())
    .pipe(gulp.dest(config.paths.PRODUCTION_ROOT+'scripts/'))
	.pipe(connect.reload());
});



gulp.task('lint', function() {
	return gulp.src(config.paths.js)
		.pipe(lint({config: 'eslint.config.json'}))
		.pipe(lint.format());
});

gulp.task('watch', function() {
	// gulp.watch(config.paths.PRODUCTION_ROOT+'index.html', ['html']);
	gulp.watch(config.paths.html, ['html']);
	gulp.watch(config.paths.css, ['css']);
	gulp.watch(config.paths.js, ['js', 'lint']);
});

gulp.task('default', ['html', 'open',  'watch', 'minifyFiles']);

gulp.task('minify', ['mincss', 'minjs']);
