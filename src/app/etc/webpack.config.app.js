const path = require('path');

const contentBase = '../src';

module.exports = {
    target: 'web',
    mode: 'development',
    context: path.resolve(__dirname, contentBase),
    entry: ['./index.app.js'],
    output: {
        path: path.resolve(__dirname, contentBase, 'dist'),
        publicPath: '/',
        filename: './bundle.app.js'
    },
    //devtool: 'nosources-source-map', // Production
    devtool: 'eval-source-map', // Development only!
    devServer: {
        contentBase: path.resolve(__dirname, contentBase),
        hot: true
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, contentBase, 'components'),
            '@css': path.resolve(__dirname, contentBase, 'assets/css'),
            '@root': path.resolve(__dirname, '../../../'),
            '@helpers': path.resolve(__dirname, contentBase, 'assets/helpers'),
            '@utils': path.resolve(__dirname, contentBase, 'assets/utils')
        },
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /defaults/],
                use: {
                    loader:  'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                },
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            }
        ]
    }
};
