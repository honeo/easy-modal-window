/*
	.cssファイルを含んだライブラリとして出力する。

		依存モジュールはバンドルしない
			このモジュールを扱う他ビルドツールで重複カット等を利用できるようにするため。
			要するに .css, /src以下のビルド関連以外の.js, style,css-loaderだけバンドルする。

		注意
			このファイルのあるディレクトリが__dirnameになる。

*/

// Mod
const path = require('path');
const webpack = require('webpack')
const {is, not, any} = require('@honeo/check');

module.exports = {
	watch: true,
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, '../'),
		filename: 'index_bundle.js',
		libraryTarget: 'umd'
	},
	// 相対パスでファイル名が指定され、node_modules以下ではないrequire,importだけ許可する
	externals(context, request, callback){
		const isBundle =  is.true(
			/\.\w+$/.test(request),
			!/node_modules/.test(context)
		);
		console.log(`bundle: ${isBundle}`, request);
		isBundle ?
			callback():
			callback(null, request);
	},
	module: {
		rules: [{
			test: /\.js$/,
			use: [{
				loader: 'babel-loader',
				options: {
					ignore: [],
					presets: [
						// tree shaking
				  		["latest", {
							es2015: {
								modules: false
							}
						}],
				  		'stage-0'
					],
					plugins: []
				}
			}]
		}, {// css modules
			test: /\.css$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader',
				options: {
					importLoaders: 1, // postcssとの衝突回避？
					modules: true
				}
			}, {
				loader: 'postcss-loader'
			}]
		}]
	}
	// plugins: [
	// 	new webpack.optimize.UglifyJsPlugin()
	// ]
}
