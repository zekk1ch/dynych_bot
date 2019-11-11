const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const env = require('./env');

module.exports = {
    mode: env.MODE,
    entry: {
        notes: ['babel-polyfill', './pwa/notes/index.js'],
        daily: ['babel-polyfill', './pwa/daily/index.js'],
    },
    output: {
        filename: '[name]/bundle.js',
        path: path.resolve('public'),
        publicPath: '/',
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
        // NOTE: to skip deletion of some static files in target folder  ==>  new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', '!do_note_delete_folder/**', '!do_not_delete_file.txt'] })
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { to: 'notes', from:'./pwa/notes/sw.js' },
            { to: 'notes', from:'./pwa/notes/swApi.js' },
            { to: 'notes', from:'./pwa/notes/actionTypes.json' },
            { to: 'notes', from:'./pwa/notes/preferencesKeys.json' },
        ]),
        new HtmlWebpackPlugin({
            chunks: ['notes'],
            filename: 'notes/index.html',
            template: './pwa/template.ejs',
            title: 'Туду',
        }),
        new HtmlWebpackPlugin({
            chunks: ['daily'],
            filename: 'daily/index.html',
            template: './pwa/template.ejs',
            title: 'Daily',
        }),
        new FaviconsWebpackPlugin ({
            inject: (htmlPlugin) => htmlPlugin.options.chunks[0] === 'notes',
            logo: './pwa/notes/logo.png',
            outputPath: '/notes/assets',
            publicPath: '/notes',
            prefix: 'assets/',
            favicons: {
                appName: 'Notes',
                appShortName: 'Notes',
                appDescription: 'This is a simple PWA that uses IndexedDB to save notes',
                background: '#fff',
                theme_color: '#fff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/notes/',
                version: '1.0.0',
            }
        }),
        new FaviconsWebpackPlugin ({
            inject: (htmlPlugin) => htmlPlugin.options.chunks[0] === 'daily',
            logo: './pwa/daily/logo.png',
            outputPath: '/daily/assets',
            publicPath: '/daily',
            prefix: 'assets/',
            favicons: {
                appName: 'Daily',
                appShortName: 'Daily',
                appDescription: 'This simple PWA will help you track your daily progress',
                background: '#fff',
                theme_color: '#fff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/daily/',
                version: '1.0.0',
            }
        }),
    ],
    devtool: 'eval-source-map',
    devServer: {
        // NOTE: very important to open dev-server links WITH A TRAILING SLASH   !!!
        hot: true,
    },
};
