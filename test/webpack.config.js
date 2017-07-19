/*
	モジュール自体をビルドしてからテスト用.jsをビルドしてサーバー立ち上げ
*/

// Mod
const webpack = require('webpack');
const opener = require('opener');

// 3秒後にブラウザで開く
setTimeout(opener, 1000, 'http://localhost:8080/');

module.exports = {
	entry: './test/index.js',
	devServer: {
		contentBase: "./test",
		hot: true,
		inline: true,
	    compress: true, // gzip
	    port: 8080
	},
	output: {
		path: __dirname,
		filename: 'bundle_index.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			use: [{
				loader: "babel-loader",
				options: {
					ignore: [
						'babel-polyfill',
						'core-js'
					],
					presets: [
				  		"babel-preset-latest",
				  		"babel-preset-stage-0"
					]
				}
			}]
		}]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(), //hotの依存
	]
}
