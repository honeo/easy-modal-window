console.log('modal-window: test');

// modules
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const opener = require('opener');
const Path = require('path');

/*
	require.resolve()を使っているのは上位ディレクトリを跨いだmy-polyfillへの解決用。
	resolveLoaderだとbabel-loaderはいいが、babel自身の呼ぶbabel-presetは解決できない。
*/
const config = {
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
					'my-polyfill',
					'core-js'
				],
				presets: [
				  	require.resolve("babel-preset-latest"),
				  	require.resolve("babel-preset-stage-0")
				]
			}
		}],
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(), //hotの依存
	]
}

const instance = webpack(config);

const server = new webpackDevServer(instance, {
	contentBase: "./test/",
	hot: true,
	inline: true
});
server.listen(8080);
opener('http://localhost:8080/');
