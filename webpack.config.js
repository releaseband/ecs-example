const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: './src/index.ts',
	output: {
		filename: 'bundle.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new HtmlWebpackPlugin({
			title: 'template',
			template: './src/index.html',
		}),
		new CopyPlugin({
			patterns: [{ from: './assets/*', to: './' }],
		}),
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 8080,
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			path: require.resolve('path-browserify'),
		},
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, loader: 'ts-loader' },
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
};