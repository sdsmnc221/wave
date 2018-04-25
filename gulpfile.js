const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const cleancss = require('gulp-cleancss');
const sass = require('gulp-sass');
const gulp = require('gulp');
const gutil = require('gulp-util');
const watch = require('gulp-sane-watch');
const minify = require('gulp-minify');

const htmlIn = ['dev/**/*.html'],
      htmlOut = 'dist',
      cssIn = ['dev/styles/*.scss', 'dev/styles/**/*.scss'],
      cssOut = 'dist/styles',
      cssDist = ['dist/styles/*.css', 'dist/styles/**/*.css'],
      cssWatch = ['dev/styles/*.scss', 'dev/styles/**/*.scss', 'dev/libs/*.scss', 'dev/libs/**/*.scss'],
      jsIn = ['dev/scripts/*.js', 'dev/scripts/**/*.js'],
      jsOut = 'dist/scripts',
      libsIn = ['dev/libs/jquery.min.js', 
                'dev/libs/moment.min.js',
                'dev/libs/Chart.min.js',
                'dev/libs/barba.min.js', 
                'dev/libs/popper.min.js', 
                'dev/libs/bootstrap.min.js',  
                ],
      libsOut = 'dist/libs',
      phpIn = ['dev/scripts/*.php', 'dev/scripts/**/*.php'],
      phpOut = 'dist/scripts',
      imgIn = ['dev/images/*.+(jpg|jpeg|gif|png|svg)', 'dev/images/**/*.+(jpg|jpeg|gif|png|svg)'],
      imgOut = 'dist/images';

//GULP UTIL - LOGGING MESSAGES
gulp.task('log', function() {
    gutil.log(gutil.colors.inverse('toto'));
});

//HTML
gulp.task('html', function() {
    gulp.src(htmlIn)
        .pipe(gulp.dest(htmlOut))
        .pipe(connect.reload());
});

//PHP
gulp.task('img', function() {
    gulp.src(imgIn)
        .pipe(gulp.dest(imgOut))
        .pipe(connect.reload());
});

//PHP
gulp.task('php', function() {
    gulp.src(phpIn)
        .pipe(gulp.dest(phpOut))
        .pipe(connect.reload());
});

//COMPILE SASS
gulp.task('sass', function() {
    gulp.src(cssIn)
        .pipe(sass({style: 'expanded'}))
            .on('error', gutil.log)
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9', 'Android >= 2.3', 'ios >= 7'],
        }))
            .on('error', gutil.log)
        .pipe(cleancss())
        .pipe(gulp.dest(cssOut))
        .pipe(connect.reload());
});

//LIBS
gulp.task('libs', function() {
    gulp.src(libsIn)
        .pipe(gulp.dest(libsOut))
        .pipe(connect.reload());
});

//BUNDLE JS SCRIPTS
gulp.task('bundle', function() {
    gulp.src(libsIn)
    .pipe(concat('bundle.js'))
    .pipe(minify({ext: {min: '.min.js'}}))
    .pipe(gulp.dest(libsOut));
});

//COMPILE ES6
gulp.task('babel', function() {
    gulp.src(jsIn)
        .pipe(babel())
            .on('error', gutil.log)
        .pipe(minify({ext: {min: '.min.js'}}))
        .pipe(gulp.dest(jsOut))
        .pipe(connect.reload());
});


//LIVE RELOAD
gulp.task('live', function() {
    connect.server({
        root: 'dist',
        livereload: true
    })
});

//WATCH FOR CHANGES
gulp.task('watch', function() {
    watch(imgIn, function() {
        gulp.start('img');  
    });
    watch(phpIn, function() {
        gulp.start('php');  
    });
    watch(htmlIn, function() {
        gulp.start('html');  
    });
    watch(cssWatch, function() {
        gulp.start('sass');  
    });
    watch(jsIn, function() {
        gulp.start('babel');  
    });
})

//PUT EVERYTHING TOGETHER
gulp.task('default', ['bundle', 'img', 'php', 'html', 'sass', 'babel', 'live', 'watch']);