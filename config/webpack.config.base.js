'use strict';

const webpack = require('webpack');
const path = require('path');
const pkg = require('../package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, '../client/index.js')
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name]_[chunkhash:8].js',
        chunkFilename: '[name]-[chunkhash:8].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader!eslint-loader'
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader']
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
                loader: 'url-loader?limit=10240&name=[name]_[hash:8].[ext]',
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.ejs$/,
                use: 'ejs-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(pkg.version)
        }),
        new webpack.ProvidePlugin({
            _: 'lodash'
        }),
        new MiniCssExtractPlugin({
            filename: '[name]_[hash].css',
            chunkFilename: '[id]_[hash].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.ejs',
            template: '../client/index.ejs',
            chunks: ['main'],
            inject: false
        })
    ]
};
