import gulp from 'gulp';
import babel from 'gulp-babel';
import { deleteAsync } from 'del';

// Clean the dist directory
gulp.task('clean', () => {
    return deleteAsync(['dist']);
});

// Transpile JavaScript files
gulp.task('transpile', () => {
    return gulp.src(['api-server/**/*.js', 'tcp-server/**/*.js'])
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(gulp.dest('dist'));
});

// Copy non-JS files
gulp.task('copy', () => {
    return gulp.src(['api-server/**/*.json', 'tcp-server/**/*.json', 'tcp-server/properties.env'])
        .pipe(gulp.dest('dist'));
});

// Default task
gulp.task('default', gulp.series('clean', 'transpile', 'copy'));