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
        todo: ['babel-polyfill', './pwa/todo/index.js'],
    },
    output: {
        filename: '[name]/app.bundle.js',
        path: path.resolve('public'),
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
        new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['todo', 'daily'] }),
        new CopyWebpackPlugin([
            { to: 'todo', from: './pwa/todo/sw.js' },
            { to: 'todo', from: './pwa/todo/swApi.js' },
            { to: 'todo', from: './pwa/todo/actionTypes.json' },
            { to: 'todo', from: './pwa/todo/preferencesKeys.json' },
        ]),
        new HtmlWebpackPlugin({
            filename: 'todo/index.html',
            template: './pwa/todo/template.ejs',
            title: 'Туду',
        }),
        new AppManifestWebpackPlugin ({
            logo: './pwa/todo/logo.png',
            output: 'todo/assets/',
            prefix: isProd ? '/todo/assets/' : '/assets/',
            persistentCache: false,
            config: {
                appName: 'Notes',
                appShortName: 'Notes',
                appDescription: 'This is a simple PWA that uses IndexedDB to save notes',
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
