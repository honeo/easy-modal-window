/*

*/

// Mod
const webpack = require('webpack');

module.exports = {
	entry: './test/index.js',
	devServer: {
		contentBase: "./test",
		hot: true,
		inline: true,
		// v3追加分
	    compress: true,
	    port: 8080
	},
	output: {
		path: __dirname,
		filename: 'bundle_index.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: "babel-loader",
			query: {
				ignore: [
					'babel-polyfill',
					'core-js'
				],
				presets: [
				  	"babel-preset-latest",
				  	"babel-preset-stage-0"
				]
			}
		}],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(), //hotの依存
	]
}
