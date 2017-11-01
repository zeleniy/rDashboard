var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var order = require('gulp-order');
var print = require('gulp-print');


gulp.task('default', ['lint']);


/*
 * Create library distributive.
 */
gulp.task('dist', [], function() {
  gulp.src('js/dashboard/**/*.js')
    .pipe(order([
      'js/dashboard/Dashboard.js',
      'js/dashboard/DataProvider.js',
      'js/dashboard/tips/Tip.js',
      'js/dashboard/tips/TitleTip.js',
      'js/dashboard/tips/SimpleTip.js',
      'js/dashboard/tips/FrequencyTip.js',
      'js/dashboard/tips/SummationTip.js',
      'js/dashboard/Config.js',
      'js/dashboard/Tooltip.js',
      'js/dashboard/Ticks.js',
      'js/dashboard/ticks/XTicks.js',
      'js/dashboard/ticks/YTicks.js',
      'js/dashboard/Widget.js',
      'js/dashboard/charts/Tiles.js',
      'js/dashboard/charts/tiles/Tile.js',
      'js/dashboard/charts/tiles/SimpleTile.js',
      'js/dashboard/charts/tiles/CaseTile.js',
      'js/dashboard/charts/PieChart.js',
      'js/dashboard/charts/BarChart.js',
      'js/dashboard/charts/ScatterPlot.js',
      'js/dashboard/charts/TreeMap.js',
      'js/dashboard/charts/Map.js',
      'js/dashboard/charts/TimeLine.js'
    ], { base: './' }))
    .pipe(print())
    .pipe(concat('dashboard.min.js'))
    .pipe(gulp.dest('dist'))
    .pipe(print(function() {
      return '.js files stored in dist/dashboard.min.js';
    }));

  gulp.src('css/dashboard/**/*.css')
    .pipe(print())
    .pipe(concat('dashboard.min.css'))
    .pipe(gulp.dest('dist'))
    .pipe(print(function() {
      return '.css files stored in dist/dashboard.min.css';
    }));
});


/*
 * Check code syntax.
 */
gulp.task('lint', function() {
  return gulp.src('js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
