// -------------------------------------------------------------
// --- Gulp Settings ---
// -------------------------------------------------------------

var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    jade        = require('gulp-jade'),
    nano        = require('gulp-cssnano'),
    uglify      = require('gulp-uglify'),
    concat      = require('gulp-concat'),
    gzip        = require('gulp-gzip'),
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    include     = require('gulp-include'),
    path        = require('path'),
    neat        = require('node-neat').includePaths,
    rename      = require('gulp-rename'),
    sourcemaps  = require('gulp-sourcemaps'),
    plumber     = require('gulp-plumber'),
    rename      = require('gulp-rename'),
    international = require('gulp-international'),
    colors      = require('colors'),
    browserSync = require('browser-sync').create(),
    postcss     = require('gulp-postcss'),
    lost        = require('lost'),
    autoprefixer = require('autoprefixer'),
    atImport    = require("postcss-import"),
    sitemap     = require('gulp-sitemap'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    reload      = browserSync.reload,
    server      = tinylr();

// -------------------------------------------------------------
// --- Asset Paths src/dist/build ---
// -------------------------------------------------------------

var paths = {
  styles: {
    src: 'src/assets/stylesheets/',
    dist: 'dist/assets/css/',
    build: 'build/assets/css/'
  },
  scripts: {
    src: 'src/assets/scripts/',
    dist: 'dist/assets/js/',
    build: 'build/assets/js/'
  },
  fonts: {
    src: 'src/assets/fonts/',
    dist: 'dist/assets/fonts/',
    build: 'build/assets/fonts/'
  },
  images: {
    src: 'src/assets/images/',
    dist: 'dist/assets/images/',
    build: 'build/assets/images/'
  },
  templates: {
    src: 'src/views/',
    dist: 'dist/',
    build: 'build/'
  }
};

// -------------------------------------------------------------
// --- Bower File Lists for SCSS, JS, IE, FONTS, etc. ---
// -------------------------------------------------------------

var bowerPath = 'bower_components/';

var cssFiles = [
  bowerPath + 'include-media/dist/',
  bowerPath + 'include-media-export/dist/'
  ];

var jsFiles = [
  bowerPath + 'jquery/dist/jquery.js',
  bowerPath + 'include-media-export/dist/include-media-1.0.1.min.js',
  paths.scripts.src + 'app.js'
  ];

var ieFiles = [
  bowerPath + 'jquery/dist/jquery.js',
  bowerPath + 'html5shiv/dist/html5shiv.js',
  bowerPath + 'selectivizr/selectivizr.js',
  bowerPath + 'calc-polyfill/calc.js'
  ];

var fontFiles = [
  paths.fonts.src + '**/**.*'
  ];

// -------------------------------------------------------------
// --- Basic Tasks ---
// -------------------------------------------------------------

gulp.task('css', function() {

  var onError = function(err) {
    console.log('[SASS Error]'.red);
    console.log('in: ' + err.fileName);
    console.log('on line: ' + err.lineNumber);
    console.log('message: ' + (err.message).red);
    this.emit('end');
  };

  return gulp
    .src(paths.styles.src + '*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: cssFiles.concat(neat)
    }))
    .pipe(postcss([
      lost(),
      autoprefixer(),
      atImport()
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  return gulp
    .src(fontFiles)
    .pipe(gulp.dest(paths.fonts.dist));
});

gulp.task('js', function() {
  return gulp
    .src(jsFiles)
    .pipe(include())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(paths.scripts.dist))
    .pipe(reload({stream:true}));
});

gulp.task('images', function() {
  return gulp
    .src(paths.images.src + '**/*')
    .pipe(gulp.dest(paths.images.dist));
});

gulp.task('ie', function() {
  return gulp
    .src(ieFiles)
    .pipe(gulp.dest(paths.scripts.dist + '/ie/'));
});

gulp.task('templates', function() {
  return gulp
    .src(paths.templates.src + '*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(international({
      filename: '${lang}/${name}.${ext}',
      verbose: true
    }))
    .pipe(gulp.dest(paths.templates.dist))
    .pipe(reload({stream:true}));
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist/'
    }
  });
});

gulp.task('watch', function() {
  server.listen(35728, function(err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch(paths.styles.src + '**/*.scss', ['css']);
    gulp.watch(paths.scripts.src + '**/*.js', ['js']);
    gulp.watch(paths.templates.src + '**/*.jade', ['templates']);
    gulp.watch(paths.images.src + '**/*.*', ['images']);

  });
});

gulp.task('default', ['js', 'ie', 'css', 'templates', 'images', 'fonts', 'watch', 'browser-sync']);

// -------------------------------------------------------------
// --- Production Build Tasks ---
// -------------------------------------------------------------

gulp.task('css-prod', function() {
  return gulp
    .src(paths.styles.src + '*.scss')
    .pipe(
      sass({
        includePaths: cssFiles.concat(neat)
      }))
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(postcss([
      lost(),
      autoprefixer(),
      atImport()
    ]))
    .pipe(nano())
    .pipe(gulp.dest(paths.styles.build));
});

gulp.task('js-prod', function() {
  return gulp
    .src(jsFiles)
    .pipe(include())
    .pipe(uglify())
    .pipe(concat('all.js'))
    .pipe(gulp.dest(paths.scripts.build));
});

gulp.task('templates-prod', function() {
  return gulp
    .src(paths.templates.src + '*.jade')
    .pipe(jade({
      pretty: false
    }))
    .pipe(international({
      filename: '${lang}/${name}.${ext}'
    }))
    .pipe(gulp.dest(paths.templates.build));
});

gulp.task('images-prod', function() {
  return gulp
    .src(paths.images.src + '**/*.*')
    .pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
    .pipe(gulp.dest(paths.images.build));
});

gulp.task('fonts-prod', function() {
  return gulp
    .src(fontFiles)
    .pipe(gulp.dest(paths.fonts.build));
});

gulp.task('compress-js', ['js-prod'], function() {
  return gulp
    .src(paths.scripts.build + 'all.min.js')
    .pipe(gzip())
    .pipe(gulp.dest(paths.scripts.build));
});

gulp.task('compress-css', ['css-prod'], function() {
  return gulp
    .src(paths.styles.build + 'all.min.css')
    .pipe(gzip())
    .pipe(gulp.dest(paths.styles.build));
});

gulp.task('sitemap', function () {
    gulp.src('./build/**/*.html')
        .pipe(sitemap({
            siteUrl: 'http://diedame.de'
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build', ['compress-js', 'compress-css', 'templates-prod', 'images-prod', 'fonts-prod', 'sitemap']);
