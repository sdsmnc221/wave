const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const cleancss = require('gulp-cleancss');
const sass = require('gulp-sass');
const gulp = require('gulp');
const gutil = require('gulp-util');
const minify = require('gulp-minify');

const htmlIn = ['dev/*.html', 'dev/**/*.html', '!dev/libs/*.html', '!dev/libs/**/*.html'],
      htmlOut = 'dist',
      cssIn = ['dev/styles/*.scss', 'dev/styles/**/*.scss'],
      cssOut = 'dist/styles',
      cssDist = ['dist/styles/*.css', 'dist/styles/**/*.css'],
      cssWatch = ['dev/styles/*.scss', 'dev/styles/**/*.scss', 'dev/libs/*.scss', 'dev/libs/**/*.scss'],
      jsIn = ['dev/scripts/*.js', 'dev/scripts/**/*.js'],
      jsOut = 'dist/scripts',
      libsIn = ['dev/libs/jquery/dist/jquery.js', 
                'dev/libs/moment/moment.js',
                'dev/libs/chart.js/dist/Chart.js',
                'dev/libs/barba.js/dist/barba.js', 
                'dev/libs/popper.js/dist/umd/popper.js', 
                'dev/libs/bootstrap/dist/js/bootstrap.js',  
                ],
      libsOut = 'dist/libs';

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
    gulp.watch(htmlIn, ['html']);
    gulp.watch(cssWatch, ['sass']);
    gulp.watch(jsIn, ['babel']);
})

//PUT EVERYTHING TOGETHER
gulp.task('default', ['bundle', 'html', 'sass', 'babel', 'live', 'watch']);