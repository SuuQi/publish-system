'use strict';

const _ = require('lodash');
const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.js');
const pkg = require('../package.json');

baseConfig.output.publicPath = pkg.publishConfig.prodResourcesPath;
baseConfig.bail = true;

baseConfig.mode = 'production';

(baseConfig.plugins || (baseConfig.plugins = [])).push(
    new webpack.DefinePlugin({
        DEVELOPMENT: false,
        DAILY: false,
        PUBLISH: true,
        publicPath: JSON.stringify(baseConfig.output.publicPath)
    })
)

module.exports = baseConfig;
