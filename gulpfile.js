// -------------------------------------------------------------
// --- Gulp Settings ---
// -------------------------------------------------------------

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    nano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    gzip = require('gulp-gzip'),
    tinylr = require('tiny-lr'),
    express = require('express'),
    app = express(),
    include = require('gulp-include'),
    path = require('path'),
    neat = require('node-neat').includePaths,
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    international = require('gulp-international'),
    colors = require('colors'),
    browserSync = require('browser-sync').create(),
    postcss = require('gulp-postcss'),
    lost = require('lost'),
    autoprefixer = require('autoprefixer'),
    atImport = require('postcss-import'),
    sitemap = require('gulp-sitemap'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    gulpNSP = require('gulp-nsp'),
    argv = require('yargs').argv,
    gulpif = require('gulp-if'),
    assets = require('postcss-assets'),
    reload = browserSync.reload,
    server = tinylr();

// -------------------------------------------------------------
// --- Asset Paths src/dist/build ---
// -------------------------------------------------------------

var paths = {
    styles: {
        src: 'src/assets/stylesheets/',
        dist: 'dist/assets/css/',
        build: 'build/assets/css/',
    },
    scripts: {
        src: 'src/assets/scripts/',
        dist: 'dist/assets/js/',
        build: 'build/assets/js/',
    },
    fonts: {
        src: 'src/assets/fonts/',
        dist: 'dist/assets/fonts/',
        build: 'build/assets/fonts/',
    },
    images: {
        src: 'src/assets/images/',
        dist: 'dist/assets/images/',
        build: 'build/assets/images/',
    },
    templates: {
        src: 'src/views/',
        dist: 'dist/',
        build: 'build/',
    },
};

// -------------------------------------------------------------
// --- File Lists for SCSS, JS, IE, FONTS, etc. ---
// -------------------------------------------------------------

var bowerPath = 'bower_components/';
var npmPath = 'node_modules/';

var cssFiles = [
    bowerPath + 'include-media/dist/',
    bowerPath + 'include-media-export/dist/',
    npmPath + 'sanitize.css/lib/',
];

var jsFiles = [
    bowerPath + 'jquery/dist/jquery.js',
    bowerPath + 'include-media-export/dist/include-media-1.0.1.min.js',
    paths.scripts.src + 'app.js',
];

var ieFiles = [
    bowerPath + 'jquery/dist/jquery.js',
    bowerPath + 'html5shiv/dist/html5shiv.js',
    bowerPath + 'selectivizr/selectivizr.js',
    bowerPath + 'calc-polyfill/calc.js',
];

var fontFiles = [
    paths.fonts.src + '**/**.*',
];

// -------------------------------------------------------------
// --- Root Language & Site URL ---
// -------------------------------------------------------------

var defaultLang = 'de';
var siteURL = 'http://example-site.com';

// -------------------------------------------------------------
// --- Tasks ---
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
        .pipe(plumber({
            errorHandler: onError,
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: cssFiles.concat(neat),
        }))
        .pipe(postcss([
            lost(),
            autoprefixer(),
            atImport(),
            assets({
                basePath: 'src/assets/',
                loadPaths: ['images/', 'fonts/'],
                relative: true,
            }),
        ]))
        .pipe(gulpif(argv.production, nano()))
        .pipe(gulpif(argv.production, gulp.dest(paths.styles.build)))
        .pipe(gulpif(argv.production, gzip()))
        .pipe(gulpif(argv.production, gulp.dest(paths.styles.build)))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
    return gulp
        .src(fontFiles)
        .pipe(gulpif(argv.production, gulp.dest(paths.fonts.build)))
        .pipe(gulp.dest(paths.fonts.dist));
});

gulp.task('js', function() {
    return gulp
        .src(jsFiles)
        .pipe(include())
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(gulpif(argv.production, uglify()))
        .pipe(gulpif(argv.production, concat('all.js')))
        .pipe(gulpif(argv.production, gulp.dest(paths.scripts.build)))
        .pipe(gulpif(argv.production, gzip()))
        .pipe(gulpif(argv.production, gulp.dest(paths.scripts.build)))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.scripts.dist))
        .pipe(reload({
            stream: true,
        }));
});

gulp.task('images', function() {
    return gulp
        .src(paths.images.src + '**/*')
        .pipe(gulpif(argv.production, imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false,
            }, ],
            use: [pngquant()],
        })))
        .pipe(gulpif(argv.production, gulp.dest(paths.images.build)))
        .pipe(gulp.dest(paths.images.dist));
});

gulp.task('ie', function() {
    return gulp
        .src(ieFiles)
        .pipe(gulpif(argv.production, gulp.dest(paths.scripts.build + '/ie/')))
        .pipe(gulp.dest(paths.scripts.dist + '/ie/'));
});

gulp.task('templates', function() {
    return gulp
        .src(paths.templates.src + '*.jade')
        .pipe(gulpif(argv.production, jade({
            pretty: false,
        })))
        .pipe(gulpif(argv.production, international({
            filename: '${lang}/${name}.${ext}',
            rootLang: defaultLang,
        })))
        .pipe(gulpif(argv.production, gulp.dest(paths.templates.build)))
        .pipe(jade({
            pretty: true,
        }))
        .pipe(international({
            filename: '${lang}/${name}.${ext}',
            verbose: true,
            rootLang: defaultLang,
        }))
        .pipe(gulp.dest(paths.templates.dist))
        .pipe(reload({
            stream: true,
        }));
});

gulp.task('sitemap', function() {
    if (argv.production) {
        gulp.src('./build/**/*.html')
            .pipe(sitemap({
                siteUrl: siteURL,
            }))
            .pipe(gulp.dest('./build'));
    } else {

    }
});

gulp.task('nsp', function(cb) {
    if (argv.production) {
        gulpNSP({
            package: __dirname + '/package.json',
        }, cb);
    } else {}
});

gulp.task('browser-sync', function() {
    if (argv.production) {
        gutil.log('Production ENV - Nothing to sync'.yellow);
    } else {
        browserSync.init({
            server: {
                baseDir: 'dist/',
            },
        });
    }
});

gulp.task('watch', function() {
    if (argv.production) {
        gutil.log('Production ENV - Nothing to watch'.yellow);
    } else {
        server.listen(35728, function(err) {
            if (err) {
                return console.log(err);
            }

            gulp.watch(paths.styles.src + '**/*.scss', ['css']);
            gulp.watch(paths.scripts.src + '**/*.js', ['js']);
            gulp.watch(paths.templates.src + '**/*.jade', ['templates']);
            gulp.watch(paths.images.src + '**/*.*', ['images']);
        });
    }
});

gulp.task('default', ['js', 'ie', 'css', 'templates', 'images', 'fonts', 'watch', 'browser-sync', 'sitemap', 'nsp']);
