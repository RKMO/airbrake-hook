/* eslint no-unused-vars: [2, {"args": "after-used", "argsIgnorePattern": "^_"}] no-console: 0  */

import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import path from 'path';
import minimist from 'minimist';

const sources = [
  './src/**/*.js',
  './gulpfile.babel.js',
];

const tests = [
  './test/**/*.js',
];


const argv = minimist(process.argv.slice(2));

const plugins = loadPlugins();
const eslint = plugins.eslint;
const mocha = plugins.mocha;

const sourcesAndTests = sources.concat(tests);

const defaultTestSrc = './test/**/*.test.js';

function isTestFile(filePath) {
  const relPath = path.relative(path.join(__dirname, 'test'), filePath);
  return relPath.substr(0, 2) !== '..';
}

function lintSrc(src = sourcesAndTests) {
  return gulp.src(src)
    .pipe(eslint())
    .pipe(eslint.format());
}

function testSrc(src = defaultTestSrc) {
  return gulp.src(src, {read: false})
    // gulp-mocha needs filepaths so you can't have any plugins before it
    .pipe(mocha({reporter: 'list'}));
}

gulp.task('lint', () => {
  return lintSrc();
});

gulp.task('dev', ['lint'], () => {
  plugins.nodemon({
    exec: 'npm run babel-node',
    script: 'src/server.js',
    ext: 'js json yaml',
    ignore: ['dist'],
    tasks: ['lint'],
  }).on('restart', () => {
    console.log('Restarted');
  });
});

gulp.task('test', () => {
  const src = argv.src || defaultTestSrc;
  return testSrc(src);
});

gulp.task('watch', () => {
  gulp.watch(sourcesAndTests, (changes) => {
    if (changes.type === 'changed') {
      lintSrc(changes.path);
      if (isTestFile(changes.path)) {
        testSrc(changes.path);
      } else {
        testSrc();
      }
    }
  });
});

gulp.task('test:watch', ['test', 'watch']);

gulp.task('default', ['dev', 'watch']);
