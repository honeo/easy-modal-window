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

ModalWindow.open(element);
```

## API

### .open(element)
モーダルウィンドウが未展開なら引数の要素を中心に展開する。  
既に展開されていれば中心の要素を引数の要素と入れ替える。  
自身を返す。

### .close()
モーダルウィンドウが展開されていれば閉じる。  
自身を返す。

### .toggle(element)
引数の要素を中心にモーダルウィンドウを展開する。  
既に展開されていれば閉じる。  
自身を返す。

## Legacy
アニメーションなしの軽量版。  
div要素でラップしてtransformで中央寄せする。
```js
import ModalWindow from 'easy-modal-window-legacy';
```
