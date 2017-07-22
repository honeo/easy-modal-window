module.exports = {
	//parser: 'sugarss',
	plugins: {
		// VP付与、レガシー変換
		"postcss-cssnext": {
			browsers: ["> 0%"]
		},
		// 圧縮
		cssnano: {
			preset: 'default'
		}
	}
}
