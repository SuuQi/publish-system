import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import reallyWebpack from 'webpack';
import BrowserSync from 'browser-sync';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpack from 'gulp-webpack';
import util from 'gulp-util';
import del from 'del';
import nodemon from 'gulp-nodemon';
import ansiHtml from 'ansi-html';
import pkg from '../package.json';

const $ = plugins();
const browserSync = BrowserSync.create();
const BROWSER_SYNC_RELOAD_DELAY = 500;
const paths = {
    tmp: path.join(__dirname, '../.tmp'),
    server: '../server',
    client: '../client',
    app: '../server/index.js',
};

// 启动开发模式
gulp.task('start:server', cb => {
    let called = false;

    return nodemon({
        script: 'development.js',
        watch: ['../server', './development.js'],
        env: { 'NODE_ENV': 'development' }
    }).on('start', () => {
        if (!called) {
            cb();
            called = true;
        }
    }).on('restart', () => {
        setTimeout(() => {
            browserSync.reload();
        }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('serve', ['start:server'], () => {
    const webpackConfig = require('./webpack.config.dev.js');
    const compiler = reallyWebpack(webpackConfig);

    // 在ejs完成编译后，将ejs文件写入到.tmp目录下
    compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-after-emit', (data, callback) => {
            const outputPath = compilation.compiler.outputPath;
            const filename = path.join(paths.tmp, data.outputName);
            mkdirp(path.dirname(filename), err => {
                // if (err) { return callback(err); }
                fs.writeFile(filename, data.html.source(), err => {
                    // if (err) { return callback(err); }
                    // callback(null);
                });
            });
        });
    });

    compiler.plugin('done', stats => {
        if (stats.hasErrors() || stats.hasWarnings()) {
            return browserSync.sockets.emit('fullscreen:message', {
                title: 'Webpack Error:',
                body: ansiHtml(stats.toString()),
                timeout: 100000
            });
        }
        browserSync.reload();
    });

    browserSync.init({
        startPath: pkg.publishConfig.path,
        https: false,
        middleware: [
            webpackDevMiddleware(compiler, {
                publicPath: webpackConfig.output.publicPath,
                noInfo: false,
                stats: {
                    colors: true,
                    timings: true,
                    chunks: false
                }
            })
        ],
        plugins: [require('bs-fullscreen-message')]
    });
});

// 清理发布目录
gulp.task('clean', done => {
    del.sync([ '../dist/**/*' ], { 'force': true });
    return done();
});

// 清理临时目录
gulp.task('clean:test', done => {
    del.sync([ '../.tmp/**/*' ], { 'force': true });
    return done();
});

// 代码校验
gulp.task('eslint', () => {
    return gulp.src([`${paths.client}/**/*.js`, `${paths.server}/**/*.js`, `!${paths.client}/assets/**`])
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});

gulp.task('copy:test', () => {
    return gulp.src(`${paths.client}/assets/**/*`)
        .pipe(gulp.dest('../.tmp/assets/'));
});

gulp.task('copy:dist', () => {
    return gulp.src(`${paths.client}/assets/**/*`)
        .pipe(gulp.dest('../dist/assets/'));
});

// 测试打包
gulp.task('dist:test', ['clean:test', 'eslint', 'copy:test'], () => {
    const webpackConfig = require('./webpack.config.test.js');

    return gulp.src(`${paths.client}/**/*.js`)
        .pipe(webpack(webpackConfig, reallyWebpack, (err, stats) => {
            if (err) throw new $.util.PluginError('webpack:build', err);

            $.util.log('[webpack:build]', stats.toString({
                colors: true
            }));
        }))
        .pipe(gulp.dest('../.tmp/'));
});

// 正式打包
gulp.task('dist:prod', ['clean', 'eslint', 'copy:dist'], () => {
    const webpackConfig = require('./webpack.config.prod.js');
    const styleFilter = $.filter(file => /\.css$/.test(file.path), { restore: true });

    return gulp.src(`${paths.client}/**/*.js`)
        .pipe(webpack(webpackConfig, reallyWebpack, (err, stats) => {
            if(err) throw new $.util.PluginError('webpack:build', err);

            $.util.log('[webpack:build]', stats.toString({
                colors: true
            }));
        }))
        .pipe(styleFilter)
        .pipe($.cleanCss())
        .pipe(styleFilter.restore)
        .pipe(gulp.dest('../dist/'));
});
