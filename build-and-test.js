/*
	test兼build.
		モジュールをwatchでライブラリ出力する
		初回出力時に出力したライブラリを対象にdev-serverを立ち上げる
*/
console.log('build-and-test.js');

// Modules
const webpack = require("webpack");
const webpackDevServer = require('webpack-dev-server');
const opener = require('opener');
const Path = require('path');
let flg = false;

// config
const config_first = {
	progress: true,
	colors: true,
	entry: './src/index.js',
	output: {
		path: __dirname,
		filename: 'bundle.js',
		libraryTarget: 'umd'
	},
	externals: /^(?!.*(index\.js|\.css)).*$/, // index.jsと.cssファイルだけバンドルする
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			query: {
				ignore: [],
				presets: [
				  	'babel-preset-latest',
				  	'babel-preset-stage-0'
				],
				plugins: []
			}
		}]
	},
	// plugins: [
	// 	new webpack.optimize.UglifyJsPlugin({
	// 		compress: {
	// 			warnings: false
	// 		}
	// 	})
	// ]
}


const config_second = {
	entry: {
		app: [
			"webpack-dev-server/client?http://localhost:8080/",
			"webpack/hot/dev-server",
			'./test/index.js'
		]
	},
	output: {
		path: __dirname,
		filename: 'bundle_index.js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			loader: require.resolve("babel-loader"),
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

// 初回
const compiler_first = webpack(config_first);
compiler_first.watch({}, (err, stats)=>{
	console.log('watch-callback');
	if( flg ){
		return;
	}

	// 二回目、初回のみ
	console.log('devServer-start');
	flg = true;
	const compiler_second = webpack(config_second);
	const server = new webpackDevServer(compiler_second, {
		contentBase: "./test/",
		hot: true,
		inline: true
	});
	server.listen(8080, ()=>{
		console.log('devServer-callback');
		opener('http://localhost:8080/');
	});

});
