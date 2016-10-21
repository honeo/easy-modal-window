# easy-modal-window
[honeo/easy-modal-window](https://github.com/honeo/easy-modal-window)  
[easy-modal-window](https://www.npmjs.com/package/easy-modal-window)

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

### .open(element)
モーダルウィンドウが未展開なら引数の要素を中心に展開する。  
既に展開されていれば中心の要素を引数の要素と入れ替える。  
展開後にresolveするpromiseを返す。

### .close()
モーダルウィンドウが展開されていれば閉じる。  
閉じた後にresolveするpromiseを返す。

### .toggle(element)
引数の要素を中心にモーダルウィンドウを展開する。  
既に展開されていれば閉じる。  
展開後・または閉じた後にresolveするpromiseを返す。

### .isOpen
展開中かどうかのBoolean.
読取専用。

### .isCloseOnBackgroundClick
✖ボタン以外にも背景クリックでモーダルウィンドウを閉じるかのBoolean.  
標準はtrue.

### Events
onopen, onreplace, onclose
```js
ModalWindow.onopen = (e)=>{
	console.log(e); // {target: element, timeStamp: number, type:"open"}
}
```
