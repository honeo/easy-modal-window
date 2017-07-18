# document
という名の作業メモ。

## Error

### module不具合
他のモジュールからWebpackのProvidePluginで読み込むと返り値オブジェクト.defaultにラップされる。
つまりはbundle.jsに'babel-plugin-add-module-exports'が適用されないっぽい。

### 連続open(replace)不具合
連続openの間にcloseした場合、挿入中の要素への参照がどこかで切れてエラーになる。
以下はv2.2.3のclose関数内でinsertedElementを扱う直前の箇所に入れた応急処置。
```js
// 挿入中要素の参照がなければ子要素を全てパージ、画面状態を解除して終了
if( !insertedElement ){
	bodyCtrl.focus();
	isOpen = false;
	bodyCtrl.view();
	EasyModalWindow::onClose({
		target: null,
		timeStamp: Date.now(),
		type: 'close'
	});
	[...obj.centeringElement.childNodes].forEach( (node)=>{
		node.remove();
	});
	return Promise.resolve();
}
```

## TODO
