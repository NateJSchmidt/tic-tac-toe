const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.glb$/,
                use:  'file-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new CopyPlugin([
            {
                from: 'node_modules/three/examples/js/libs/draco/gltf/*',
                to: './decoder',
                flatten: true,
            },
        ]),
    ],
    resolve: {
        extensions: [
            '.ts',
            '.glb',
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './build'),
    },
};
