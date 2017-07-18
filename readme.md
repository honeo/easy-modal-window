# easy-modal-window

## なにこれ
Flexbox実装のかんたんモーダルウィンドウ。

## 使い方
```sh
$ npm i easy-modal-window
```
```js
import ModalWindow from 'easy-modal-window';

const promise = ModalWindow.open(element);
```


## API

### .open(element or selector)
引数の要素orセレクタに一致する最初の要素をモーダルウィンドウで展開する。  
既に展開されていれば入れ替える。  
展開後に解決するpromiseを返す。
```js
const promise = await ModalWindow.open(element);

const promise = await ModalWindow.open('selector');
```


### .close()
モーダルウィンドウが展開されていれば閉じる。  
閉じた後に解決するpromiseを返す。


### .toggle(element)
引数の要素を中心にモーダルウィンドウを展開する。  
既に展開されていれば閉じる。  
展開後・または閉じた後に解決するpromiseを返す。


### .backgroundColor
展開中の背景色に使用する文字列。  
```js
ModalWindow.backgroundColor; // "rgba(0,0,0, 0.7)"
ModalWindow.backgroundColor = "red";
```

### .insertedElement
モーダルウィンドウで展開中の要素への参照。
```js
ModalWindow.insertedElement; // null
await ModalWindow.open(element);
ModalWindow.insertedElement; // element
```

### .isBackgroundBlur
モーダルウィンドウの展開中に背景をボカすか。
```js
ModalWindow.isBackgroundBlur; // true
ModalWindow.isBackgroundBlur = false;
```

### .isCloseOnBackgroundClick
✕ボタン以外にも背景クリックでモーダルウィンドウを閉じるか。  
```js
ModalWindow.isCloseOnBackgroundClick; // true
ModalWindow.isCloseOnBackgroundClick = false;
```

### .isCloseOnInsertedElement
✕ボタン以外にも展開中の要素クリックでモーダルウィンドウを閉じるか。
```js
ModalWindow.isCloseOnInsertedElement; // false
ModalWindow.isCloseOnInsertedElement = true;
```

### .isHideScrollbar
モーダルウィンドウの展開中にbodyのスクロールバーを隠すか。
falseの場合、windowサイズより大きい要素を展開するとスクロールバーがー二重になる。
```js
ModalWindow.isHideScrollbar; // true
ModalWindow.isHideScrollbar = false;
```

### .isOpen
モーダルウィンドウが展開中ならtrue、そうでなければfalseが入る。
読取専用。
```js
ModalWindow.isOpen; // false
await ModalWindow.open(element);
ModalWindow.isOpen; // true
```

### Events
* onopen
* onreplace
* onclose

```js
ModalWindow.onopen = (evt)=>{
	console.log(evt); // {target: element, timeStamp: number, type: "open"}
}
```
