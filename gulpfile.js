import gulp from 'gulp';
import babel from 'gulp-babel';
import ts from 'gulp-typescript';
import { deleteAsync } from 'del';

// Clean the dist directory
const clean = () => deleteAsync(['dist']);

// Transpile JavaScript files for api-server
const transpileApiServer = () => {
    return gulp.src('api-server/**/*.js')
        .pipe(babel({
            presets: [['@babel/preset-env', { modules: false }]]
        }))
        .pipe(gulp.dest('dist/api-server'));
};

// Transpile JavaScript files for tcp-server
const transpileTcpServer = () => {
    return gulp.src('tcp-server/**/*.js')
        .pipe(babel({
            presets: [['@babel/preset-env', { modules: false }]]
        }))
        .pipe(gulp.dest('dist/tcp-server'));
};

// Transpile model files
const transpileModel = () => {
    return gulp.src('model/**/*.js')
        .pipe(babel({
            presets: [['@babel/preset-env', { modules: false }]]
        }))
        .pipe(gulp.dest('dist/model'));
}

// Copy non-JS files for api-server
const copyApiServer = () => {
    return gulp.src(['api-server/**/*.json', 'api-server/properties.env'])
        .pipe(gulp.dest('dist/api-server'));
};

// Copy non-JS files for tcp-server
const copyTcpServer = () => {
    return gulp.src(['tcp-server/**/*.json', 'tcp-server/properties.env'])
        .pipe(gulp.dest('dist/tcp-server'));
};

// Copy non-JS files for model
const copyModel = () => {
    return gulp.src('model/**/*.json')
        .pipe(gulp.dest('dist/model'));
};

// Copy keys and certs
const copyKeys = () => {
    return gulp.src('keys/**/*')
        .pipe(gulp.dest('dist/keys'));
}

const copyCerts = () => {
    return gulp.src('certs/**/*')
        .pipe(gulp.dest('dist/certs'));
}

// Generate package.json
const generatePackageJson = () => {
    return gulp.src('package.json')
        .pipe(gulp.dest('dist'));
};


// Create a TypeScript project
const tsProject = ts.createProject('tsconfig.json');

// Transpile TypeScript files for api-server
const transpileApiServerTS = () => {
    return gulp.src('api-server/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/api-server-ts'));
};

// Transpile TypeScript files for tcp-server
const transpileTcpServerTS = () => {
    return gulp.src('tcp-server/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist/tcp-server-ts'));
};

// Wrapper for the clean task
gulp.task('clean', clean);

// Wrapper for transpiling JavaScript
gulp.task('transpile', gulp.parallel(transpileApiServer, transpileTcpServer,transpileModel));

// Wrapper for copying non-JS files
gulp.task('copy', gulp.parallel(copyApiServer, copyTcpServer, copyModel, copyKeys, copyCerts));


// Task to transpile JavaScript files
gulp.task('package-js', gulp.series(transpileApiServer, transpileTcpServer, transpileModel, "copy")); // gulp.parallel(copyApiServer, copyTcpServer, copyModel)));

// Task to transpile TypeScript files
gulp.task('package-ts',  gulp.parallel(transpileApiServerTS, transpileTcpServerTS));

// Default task
gulp.task('default', gulp.series(clean, gulp.series(transpileApiServer, transpileTcpServer, transpileModel, "copy", generatePackageJson)));