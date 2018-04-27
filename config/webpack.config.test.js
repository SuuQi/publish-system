'use strict';

const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.js');
const pkg = require('../package.json');

baseConfig.output.path = path.resolve(__dirname, '../.tmp');
baseConfig.output.publicPath = pkg.publishConfig.testResourcesPath;

baseConfig.devtool = 'source-map';
baseConfig.bail = true;

baseConfig.mode = 'production';

baseConfig.plugins = (baseConfig.plugins || []).concat([
    new webpack.DefinePlugin({
        DEVELOPMENT: false,
        TEST: true,
        publicPath: JSON.stringify(baseConfig.output.publicPath)
    })
]);

module.exports = baseConfig;
