const path = require('path');

const contentBase = '../src';

module.exports = {
    target: 'web',
    mode: 'development',
    context: path.resolve(__dirname, contentBase),
    entry: ['@babel/polyfill', './index.app.js'],
    output: {
        path: path.resolve(__dirname, contentBase, 'build'),
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
            'assets': path.resolve(__dirname, contentBase, 'assets'),
            'components': path.resolve(__dirname, contentBase, 'components'),
            'css': path.resolve(__dirname, contentBase, 'assets/css'),
            'functions': path.resolve(__dirname, contentBase, 'assets/utils/functions'),
            'helpers': path.resolve(__dirname, contentBase, 'assets/helpers'),
            'root': path.resolve(__dirname, '../../../'),
            'specializations': path.resolve(__dirname, contentBase, 'assets/specializations'),
            'src': path.resolve(__dirname, contentBase),
            'utils': path.resolve(__dirname, contentBase, 'assets/utils')
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
