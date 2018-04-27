'use strict';

const webpack = require('webpack');
const baseConfig = require('./webpack.config.base.js');
const path = require('path');

baseConfig.devtool = 'source-map';

baseConfig.mode = 'development';

(baseConfig.plugins || (baseConfig.plugins = [])).push(
    new webpack.DefinePlugin({
        DEVELOPMENT: true,
        DAILY: false,
        PUBLISH: false,
        publicPath: JSON.stringify(baseConfig.output.publicPath)
    })
)

module.exports = baseConfig;
