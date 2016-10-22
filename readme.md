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

### .isBackgroundBlur
モーダルウィンドウの展開中に背景をボカすか。  
標準はtrue.

### .isOpen
モーダルウィンドウが展開中ならtrueを、そうでなければfalseが入る。
読取専用。

### .isCloseOnBackgroundClick
✖ボタン以外にも背景クリックでモーダルウィンドウを閉じるか。  
標準はtrue.

### Events
onopen, onreplace, onclose
```js
ModalWindow.onopen = (e)=>{
	console.log(e); // {target: element, timeStamp: number, type:"open"}
}
```
