# document
という名の作業メモ。

```bash
# build
$ npm run build

# test, ブラウザ起動
$ npm t
```

## TODO
* style-loaderをバンドルしたくない
* npm t でビルドと動作確認をまとめて行うようにしたい
* メソッド同時使用時の処理がごちゃごちゃ
 * promise-stack使うか。
* PostCSSによるVP付与＋圧縮
* Firefoxで閉じる際にコンテンツがチラつく
 * replaceテストではちらつかない。
 * やはり背景色だけでなく、コンテナ＋アイテムをまとめて透明アニメーションすべきか。
* [スクロールバーの幅を考慮したモーダル処理 [JavaScript] | バシャログ。](http://bashalog.c-brains.jp/17/04/10-163000.php)
 * 参考にする。

## Error

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
