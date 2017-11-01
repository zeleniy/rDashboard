var gulp = require('gulp');
var jshint = require('gulp-jshint');
// var concat = require('gulp-concat');
// var order = require('gulp-order');


gulp.task('default', ['lint']);


/*
 * Create library distributive.
 */
// gulp.task('dist', [], function() {
//     return gulp.src('js/universalChart/**/*.js')
//         .pipe(order([
//             'js/universalChart/Formatter.js',
//             'js/universalChart/Config.js',
//             'js/universalChart/Util.js',
//             'js/universalChart/MMargin.js',
//             'js/universalChart/View.js',
//             'js/universalChart/views/ViewFactory.js',
//             'js/universalChart/Scope.js',
//             'js/universalChart/Legend.js',
//             'js/universalChart/legend/LegendFactory.js',
//             'js/universalChart/legend/ColumnLegend.js',
//             'js/universalChart/legend/RowLegend.js',
//             'js/universalChart/Color.js',
//             'js/universalChart/Pointer.js',
//             'js/universalChart/Ticks.js',
//             'js/universalChart/ticks/XTicks.js',
//             'js/universalChart/ticks/YTicks.js',
//             'js/universalChart/Tooltip.js',
//             'js/universalChart/tooltip/TooltipState.js',
//             'js/universalChart/tooltip/TooltipStateFactory.js',
//             'js/universalChart/tooltip/TooltipSingleState.js',
//             'js/universalChart/tooltip/TooltipCombinedState.js',
//             'js/universalChart/orientations/Orientation.js',
//             'js/universalChart/orientations/OrientationFactory.js',
//             'js/universalChart/orientations/VerticalOrientation.js',
//             'js/universalChart/orientations/HorizontalOrientation.js',
//             'js/universalChart/views/SvgView.js',
//             'js/universalChart/views/View1D.js',
//             'js/universalChart/views/View2D.js',
//             'js/universalChart/views/BarView.js',
//             'js/universalChart/views/bar/BarViewFactory.js',
//             'js/universalChart/views/bar/VerticalView.js',
//             'js/universalChart/views/bar/HorizontalView.js',
//             'js/universalChart/views/bar/StackedView.js',
//             'js/universalChart/views/bar/StackedHorizontalView.js',
//             'js/universalChart/views/bar/StackedVerticalView.js',
//             'js/universalChart/views/bar/GroupedView.js',
//             'js/universalChart/views/bar/GroupedHorizontalView.js',
//             'js/universalChart/views/bar/GroupedVerticalView.js',
//             'js/universalChart/views/DotView.js',
//             'js/universalChart/views/LineView.js',
//             'js/universalChart/views/line/LineState.js',
//             'js/universalChart/views/line/LineStateFactory.js',
//             'js/universalChart/views/line/LineHorizontalState.js',
//             'js/universalChart/views/line/LineVerticalState.js',
//             'js/universalChart/views/AreaView.js',
//             'js/universalChart/views/area/AreaVerticalState.js',
//             'js/universalChart/views/area/AreaHorizontalState.js',
//             'js/universalChart/views/PieView.js',
//             'js/universalChart/views/DonutView.js',
//             'js/universalChart/views/TableView.js',
//             'js/universalChart/uChart/UChartFactory.js',
//             'js/universalChart/UChart.js',
//             'js/universalChart/uChart/UHtmlChart.js',
//             'js/universalChart/uChart/USvgChart.js',
//             'js/universalChart/uChart/U1DChart.js',
//             'js/universalChart/uChart/U2DChart.js',
//             'js/universalChart/uChart/U2DVerticalChart.js',
//             'js/universalChart/uChart/U2DHorizontalChart.js'
//         ]))
//     .pipe(concat('uchart.min.js'))
//     .pipe(gulp.dest('dist'))
// });


/*
 * Check code syntax.
 */
gulp.task('lint', function() {
    return gulp.src('js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
