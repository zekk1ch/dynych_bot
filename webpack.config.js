const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');
const env = require('./env');
const appManifest = require('./pwa/appManifest');


module.exports = {
    mode: env.MODE,
    entry: {
        app: ['babel-polyfill', './pwa/index.js'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve('public', 'todo'),
        publicPath: env.MODE === 'production' ? '/todo' : '/',
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
            title: 'Туду',
            template: './pwa/template.ejs',
            viewport: 'width=device-width, initial-scale=1',
        }),
        new AppManifestWebpackPlugin ({
            logo: './pwa/logo.png',
            output: 'assets/',
            prefix: '/assets/',
            persistentCache: false,
            config: appManifest,
        }),
    ],
    devtool: 'eval-source-map',
    devServer: {
        hot: true,
    },
};
