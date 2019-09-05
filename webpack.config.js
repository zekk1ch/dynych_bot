const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const env = require('./env');

module.exports = {
    mode: env.MODE,
    entry: './pwa/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve('./public/todo'),
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
        new HtmlPlugin({
            title: 'Туду',
            template: './pwa/index.html',
        }),
    ],
    devServer: {
        hot: true,
    },
};
