const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');
const env = require('./env');
const isProd = env.MODE === 'production';

module.exports = {
    mode: env.MODE,
    entry: {
        app: ['babel-polyfill', './pwa/index.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve('public', 'todo'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: '/node_modules/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                        ],
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            './pwa/sw.js',
        ]),
        new HtmlWebpackPlugin({
            template: './pwa/template.ejs',
            title: 'Туду',
        }),
        new AppManifestWebpackPlugin ({
            logo: './pwa/logo.png',
            output: 'assets/',
            prefix: isProd ? '/todo/assets/' : '/assets/',
            persistentCache: false,
            config: {
                appName: 'Notes',
                appShortName: 'Notes',
                appDescription: 'This is a simple PWA that saves notes in cache memory',
                background: '#fff',
                theme_color: '#fff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: isProd ? '/todo/' : '/',
                version: '1.0.0',
            },
        }),
    ],
    devtool: 'eval-source-map',
    devServer: {
        hot: true,
    },
};
