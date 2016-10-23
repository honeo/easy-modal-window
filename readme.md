# easy-modal-window

## なにこれ
Flexbox実装のかんたんモーダルウィンドウ。

## 使い方
```sh
$ npm i -S easy-modal-window
```
```js
import ModalWindow from 'easy-modal-window';

const promise = ModalWindow.open(element);
```

## API

### .open(element or selector)
引数の要素orセレクタに一致する最初の要素をモーダルウィンドウで展開する。  
既に展開されていれば入れ替える。  
展開後にresolveするpromiseを返す。
```js
ModalWindow.open(element).then(_=>{
	return ModalWindow.open('.foobar');
})
```

### .close()
モーダルウィンドウが展開されていれば閉じる。  
閉じた後にresolveするpromiseを返す。

### .toggle(element)
引数の要素を中心にモーダルウィンドウを展開する。  
既に展開されていれば閉じる。  
展開後・または閉じた後にresolveするpromiseを返す。

### .backgroundColor
展開中の背景色に使用する文字列。  
標準は "rgba(0,0,0, 0.7)" .
```js
console.log(ModalWindow.backgroundColor); // "rgba(0,0,0, 0.7)"
ModalWindow.backgroundColor = "red";
```

### .insertedElement
モーダルウィンドウで展開中の要素への参照。
```js
console.log(ModalWindow.insertedElement); // null
ModalWindow.open(element).then( _=>{
	console.log(ModalWindow.insertedElement); // element
});
```

### .isBackgroundBlur
モーダルウィンドウの展開中に背景をボカすか。
```js
console.log(ModalWindow.isBackgroundBlur); // true
ModalWindow.isBackgroundBlur = false;
```

### .isOpen
モーダルウィンドウが展開中ならtrueを、そうでなければfalseが入る。
読取専用。
```js
console.log(ModalWindow.isOpen); // false
ModalWindow.open(element).then( _=>{
	console.log(ModalWindow.isOpen); // true
});
```

### .isCloseOnBackgroundClick
✕ボタン以外にも背景クリックでモーダルウィンドウを閉じるか。  
```js
console.log(ModalWindow.isCloseOnBackgroundClick); // true
ModalWindow.isCloseOnBackgroundClick = false;
```

### Events
onopen, onreplace, onclose
```js
ModalWindow.onopen = (e)=>{
	console.log(e); // {target: element, timeStamp: number, type:"open"}
}
```
