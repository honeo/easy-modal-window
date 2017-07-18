(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@honeo/check"), require("style-handle"), require("@honeo/await-event"), require("make-element"));
	else if(typeof define === 'function' && define.amd)
		define(["@honeo/check", "style-handle", "@honeo/await-event", "make-element"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("@honeo/check"), require("style-handle"), require("@honeo/await-event"), require("make-element")) : factory(root["@honeo/check"], root["style-handle"], root["@honeo/await-event"], root["make-element"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _awaitEvent = __webpack_require__(3);

var _awaitEvent2 = _interopRequireDefault(_awaitEvent);

var _makeElement = __webpack_require__(4);

var _makeElement2 = _interopRequireDefault(_makeElement);

var _check = __webpack_require__(0);

var _styleHandle = __webpack_require__(1);

var _styleHandle2 = _interopRequireDefault(_styleHandle);

var _events = __webpack_require__(5);

var _index = __webpack_require__(6);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Var

// Lib
/*
    要件
        アニメーション
            展開・閉じる際の背景色。
            展開中に後ろの各要素のボカシ。
            展開・閉じる際の挿入した要素の透明度。
        中央寄せ
            flexbox実装。
            中身のサイズに合わせてページサイズ（スクロール領域）が変化する。
            中央寄せで上下左右が画面外にはみ出さない。
            外から挿入した要素の外部にレスポンシブなスペースがある。
                上部には閉じるボタンがあり、最低限そのサイズ分のスペースは保持する。
        閉じるボタン
            windowより挿入要素が大きいと背景クリックで閉じられなくなり
            挿入要素内で .close() を呼び出していなかった場合はハマるため。
    TODO:
        閉じるボタン
            スクロールバー表示の有無に関わらず画面右上から一定位置にしたい。
            fixedにして上部スペースに被せても横スクロールに追従しないからイマイチ。
            縦だけscrollに合わせて移動するように弄っても、スクロールバーが表示される場合に被って不格好になる。
*/

// Mod
var ModuleName = 'easy-modal-window';
var doc = document;
var head = doc.head;
var body = doc.body;
var duration_ms = 160; //アニメーション総時間
var weakMap = new WeakMap(); // selectorから挿入した要素:挿入地点メモのダミー要素
var isOpen = false; // 展開の状態、同期処理内で早めに切り替える、Promise#resolveのタイミングとは関係ない
var isBackgroundBlur = true; // 展開中に背景をボカすか
var isCloseOnBackgroundClick = true; // 背景クリックでも閉じるかどうか
var isCloseOnInsertedElement = false; // 挿入した要素のクリックでも閉じるか
var isHideScrollbar = true; // 展開中にbodyのスクロールバーを隠すか
var insertedElement = void 0; // 外部から挿入中の要素
var backgroundColor = 'rgba(0,0,0, 0.72)'; // 背景色

// Styleまとめ、本当はAutoPrefix→圧縮→CSS Module読み込みしたいが
var css_text = '\n    /* DOM\u69CB\u9020\u9806 */\n\n    .' + ModuleName + '-container,\n    .' + ModuleName + '-space_top,\n    .' + ModuleName + '-space_top-closeButton,\n    .' + ModuleName + '-centering,\n    .' + ModuleName + '-space_bottom {\n        margin: 0;\n        padding: 0;\n        -webkit-box-sizing: border-box;\n        -moz-box-sizing: border-box;\n        box-sizing: border-box;\n    }\n\n    .' + ModuleName + '-container {\n        display: -webkit-box;\n        display: -webkit-flex;\n        display: -moz-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-orient: vertical;\n        -webkit-box-direction: normal;\n        -webkit-flex-direction: column;\n        -moz-box-orient: vertical;\n        -moz-box-direction: normal;\n        -ms-flex-direction: column;\n        flex-direction: column;\n        -webkit-box-pack: justify;\n        -webkit-justify-content: space-between;\n        -moz-box-pack: justify;\n        -ms-flex-pack: justify;\n        justify-content: space-between;\n        -webkit-box-align: center;\n        -webkit-align-items: center;\n        -moz-box-align: center;\n        -ms-flex-align: center;\n        align-items: center;\n        -webkit-flex-shrink: 0;\n        -ms-flex-negative: 0;\n        flex-shrink: 0;\n        position: fixed;\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        overflow: auto;\n        z-index: 1000;\n    }\n\n    .' + ModuleName + '-space_top {\n        /* min-height: 2.2rem; */\n        -webkit-box-flex: 50;\n        -webkit-flex-grow: 50;\n        -moz-box-flex: 50;\n        -ms-flex-positive: 50;\n        flex-grow: 50;\n        -webkit-flex-shrink: 0;\n        -ms-flex-negative: 0;\n        flex-shrink: 0;\n    }\n    .' + ModuleName + '-space_top-closeButton {\n        position: fixed;\n        top: 1vh;\n        right: 1vw;\n        padding: 0.3rem;\n        color: white;\n        font-size: 1.6rem;\n        cursor: default;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n        user-select: none;\n        -webkit-transition: 0.3s;\n        -o-transition: 0.3s;\n        -moz-transition: 0.3s;\n        transition: 0.3s;\n    }\n    .' + ModuleName + '-space_top-closeButton:hover {\n        color: firebrick;\n        transition: 0.3s;\n    }\n\n    .' + ModuleName + '-centering {\n        max-width: 100%;\n        /* max-height: 100%; */\n        flex-shrink: 0;\n    }\n\n    .' + ModuleName + '-space_bottom {\n        -webkit-box-flex: 50;\n        -webkit-flex-grow: 50;\n        -moz-box-flex: 50;\n        -ms-flex-positive: 50;\n        flex-grow: 50;\n    }\n';

/*
    APIの入れ物
        設定値はプロパティ用オブジェクトを作って変数とまとめたいが
*/
var EasyModalWindow = {
    get backgroundColor() {
        return backgroundColor;
    },
    set backgroundColor(colortext) {
        if (_check.is.str(colortext)) {
            backgroundColor = colortext;
        }
    },
    get insertedElement() {
        return insertedElement;
    },
    get isOpen() {
        return isOpen;
    },
    get isBackgroundBlur() {
        return isBackgroundBlur;
    },
    set isBackgroundBlur(arg) {
        if (_check.is.bool(arg)) {
            isBackgroundBlur = arg;
        }
    },
    get isCloseOnBackgroundClick() {
        return isCloseOnBackgroundClick;
    },
    set isCloseOnBackgroundClick(arg) {
        if (_check.is.bool(arg)) {
            isCloseOnBackgroundClick = arg;
        }
    },
    get isCloseOnInsertedElement() {
        return isCloseOnInsertedElement;
    },
    set isCloseOnInsertedElement(arg) {
        if (_check.is.bool(arg)) {
            isCloseOnInsertedElement = arg;
        }
    },
    get isHideScrollbar() {
        return isHideScrollbar;
    },
    set isHideScrollbar(arg) {
        if (_check.is.bool(arg)) {
            isHideScrollbar = arg;
        }
    },
    open: open,
    close: close,
    toggle: toggle,
    debug: false

    /*
        各要素の入れ物
            なければ作って返す
        構造
            containerElement: Container
                space_top: Item
                centeringElement: Item
                    Contents
                space_bottom: Item
    */
};var obj = {
    // 上部スペースと✕ボタン
    get space_top() {
        if (!this._space_top) {
            // 親
            var div = (0, _makeElement2.default)('div', {
                class: ModuleName + '-space_top'
            });
            // 子、ボタン代わり
            var div_closeButton = (0, _makeElement2.default)('div', '✕', {
                class: ModuleName + '-space_top-closeButton'
            });
            div.appendChild(div_closeButton);
            this._space_top = div;
        }
        return this._space_top;
    },

    // 下部スペース
    get space_bottom() {
        if (!this._space_bottom) {
            // 親
            var div = (0, _makeElement2.default)('div', {
                class: ModuleName + '-space_bottom'
            });
            this._space_bottom = div;
        }
        return this._space_bottom;
    },

    // 背景＆flexboxコンテナ、本体要素
    get containerElement() {
        if (!this._containerElement) {
            EasyModalWindow.debug && console.log(ModuleName + ': create containerElement');
            var div = (0, _makeElement2.default)('div', {
                class: ModuleName + '-container'
            });
            this._containerElement = div;

            div.append(obj.space_top);
            div.append(obj.centeringElement);
            div.append(obj.space_bottom);

            // 閉じる設定
            window.addEventListener('click', function (e) {
                if (isCloseOnBackgroundClick && e.target === div) {
                    // 設定有効なら背景クリック時
                    close();
                } else if (e.target.className === ModuleName + '-space_top-closeButton') {
                    // 閉じるボタン
                    close();
                } else if (isCloseOnInsertedElement && (e.target === insertedElement || insertedElement.contains(e.target))) {
                    // 設定有効なら挿入した要素かその子孫
                    close();
                }
            }, true);
            // CSS適用
            _styleHandle2.default.addText(css_text);
        }
        return this._containerElement;
    },

    // flexboxアイテム、中央寄せ用
    get centeringElement() {
        if (!this._centeringElement) {
            var div = (0, _makeElement2.default)('div', {
                class: ModuleName + '-centering'
            });
            this._centeringElement = div;
        }
        return this._centeringElement;
    },

    // selectorから挿入した要素と入れ替えで置いておくやつ
    get dummyElement() {
        if (!this._dummyElement) {
            this._dummyElement = (0, _makeElement2.default)('span', {
                class: ModuleName + '-dummy',
                style: 'display: none;'
            });
        }
        return this._dummyElement;
    }
};

/*
    引数要素でモーダルウィンドウを開く
        引数がElementならそのまま使い、文字列ならselectorとして扱い検索する。
            一致する要素を持つselector文字列でない場合はrejectする。
        既に開いていれば中身の要素を入れ替える
        promiseを返す
        なるべく素早く内容が確認できるように挿入要素のアニメーションは短く
*/
function open(item) {
    // 引数チェック、エラーを投げるのは引数が要素でも文字列でもない場合のみ、他はrejectする
    if (_check.is.str(item)) {
        var element = doc.querySelector(item);
        if (element) {
            // 対になるダミー要素を作って入れ替え
            var dummy = obj.dummyElement.cloneNode(true);
            weakMap.set(element, dummy);
            element.replaceWith(dummy);
            item = element;
        } else {
            return Promise.reject(item + ': not found');
        }
    } else if (_check.not.element(item)) {
        throw new TypeError('invalid argument');
    }
    // 既に開いていれば入れ替える
    if (isOpen) {
        return replace(item);
    }

    return new Promise(function (resolve, reject) {

        body.appendChild(obj.containerElement);
        obj.centeringElement.appendChild(item);

        // 挿入中要素メモ
        insertedElement = item;

        // 設定有効時、body要素をheight100%に縮小して非表示部分を隠す
        isHideScrollbar && _index2.default.hidden();

        // モーダルウィンドウ（背景）をフェードイン、挿入要素より遅らせる
        var container_apObj = obj.containerElement.animate([{
            background: 'rgba(0,0,0, 0)'
        }, {
            background: backgroundColor
        }], {
            duration: 334,
            easing: 'ease-out',
            fill: 'forwards'
        });

        // 中身をフェードイン
        var item_apObj = item.animate([{
            opacity: 0
        }, {
            opacity: 1
        }], {
            duration: duration_ms,
            easing: 'ease-out',
            fill: 'none'
        });

        // 設定有効時はモーダル以外をボカす
        isBackgroundBlur && _index2.default.blur({ selector: '.' + obj.containerElement.className });

        // アニメーション終了時にresolve
        container_apObj.onfinish = function (e) {
            resolve();
            _events.onOpen.call(EasyModalWindow, {
                target: item,
                timeStamp: Date.now(),
                type: 'open'
            });
        };
        isOpen = true;
    });
}

/*
    中身を入れ替える
        旧アイテムをフェードアウト＞新アイテムをフェードイン＞resolve
            OUT,INを両方行うためアニメーション時間はそれぞれ2/3に短縮
        promiseを返す
        openから呼び出して使う
            引数チェックはopenでやったから省略
*/
function replace(item_new) {
    return new Promise(function (resolve, reject) {
        // 古いアイテムをフェードアウト
        var apObj_old = insertedElement.animate([{
            opacity: 1
        }, {
            opacity: 0
        }], {
            duration: duration_ms / 1.5,
            fill: 'forwards'
        }).onfinish = resolve;
    }).then(function (e) {
        // フェードアウト後にパージ、selectorなら対になるダミー要素があるから入れ替える
        if (weakMap.has(insertedElement)) {
            var dummy = weakMap.get(insertedElement);
            dummy.replaceWith(insertedElement);
        } else {
            insertedElement.remove();
        }

        // 新アイテムを挿入して変数上書きしてフェードイン
        obj.centeringElement.appendChild(item_new);
        insertedElement = item_new;
        var item_apObj = item_new.animate([{
            opacity: 0
        }, {
            opacity: 1
        }], {
            duration: duration_ms / 1.5,
            fill: 'forwards'
        });
        return (0, _awaitEvent2.default)(item_apObj, 'finish', false);
    }).then(function (e) {
        _events.onReplace.call(EasyModalWindow, {
            target: item_new,
            timeStamp: Date.now(),
            type: 'replace'
        });
    });
}

/*
    展開中なら閉じる
        promiseを返す
        展開中ならコンテナ・アイテムのフェードアウトを待ってresolve
        展開中でなければ即resolve
        すぐ操作できるように閉じる際は素早く
*/
function close() {
    if (!isOpen) {
        _events.onClose.call(EasyModalWindow, {
            target: null,
            timeStamp: Date.now(),
            type: 'close'
        });
        return Promise.resolve();
    }

    // コンテナをフェードアウト
    var container_apObj = obj.containerElement.animate([{
        background: backgroundColor
    }, {
        background: 'rgba(0,0,0, 0)'
    }], {
        duration: duration_ms,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
    var container_promise = (0, _awaitEvent2.default)(container_apObj, 'finish', false);

    // // アイテムをフェードアウト
    // const insertedElement_apObj = insertedElement.animate([{
    //     opacity: 1
    // }, {
    //     opacity: 0
    // }], {
    //     duration: duration_ms,
    //     fill: 'none'
    // });
    // const insertedElement_promise = AwaitEvent(insertedElement_apObj, 'finish', false);

    _index2.default.focus(); // ボカし解除、ボカしてなければ無反応
    isOpen = false;

    // 両フェードアウトが終わればパージしてwindowサイズを戻してresolve
    return Promise.all([container_promise
    //,insertedElement_promise
    ]).then(function (evtArr) {

        obj.containerElement.remove();

        // パージ、selectorなら対になるダミー要素があるから入れ替える
        if (weakMap.has(insertedElement)) {
            var dummy = weakMap.get(insertedElement);
            dummy.replaceWith(insertedElement);
        } else {
            insertedElement.remove();
        }

        _index2.default.view(); // windowサイズ復元
        // closeイベント
        _events.onClose.call(EasyModalWindow, {
            target: insertedElement,
            timeStamp: Date.now(),
            type: 'close'
        });
        // 挿入中メモ削除
        insertedElement = null;
    });
}

/*
    トグル
        promiseを返す
*/
function toggle(element) {
    return isOpen ? close() : open(element);
}

exports.default = EasyModalWindow;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onClose = exports.onReplace = exports.onOpen = undefined;

var _check = __webpack_require__(0);

function onOpen(e) {
    _check.is.func(this.onopen) && this.onopen(e);
} /*
      簡易イベント実装
          モジュールオブジェクトにlistenerがあれば実行する
          this = モジュールオブジェクト
  */

// Modules


function onReplace(e) {
    _check.is.func(this.onreplace) && this.onreplace(e);
}

function onClose(e) {
    _check.is.func(this.onclose) && this.onclose(e);
}

exports.onOpen = onOpen;
exports.onReplace = onReplace;
exports.onClose = onClose;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _styleHandle = __webpack_require__(1);

var _styleHandle2 = _interopRequireDefault(_styleHandle);

var _check = __webpack_require__(0);

var _style = __webpack_require__(7);

var _style2 = _interopRequireDefault(_style);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// CSS Modules

// Var
var doc = document; /*
                        bodyに対してあれこれ
                            全て自身を返す
                            bodyサイズを変更・解除
                                body要素をheight100%に縮小して非表示部分を隠す
                            全ての要素をボカす
                                引数オブジェクトで除外するselectorとアニメーション秒数を指定する。
                    */

// Modules

var body = doc.body;
var debug = false;

// bodyサイズをwindow100%に縮小
function hidden() {
    debug && console.log('hidden');
    body.classList.add(_style2.default._body);
    return this;
}

// bodyサイズの縮小を解除
function view() {
    debug && console.log('view');
    body.classList.remove(_style2.default._body);
    return this;
}

/*
    ボカし用
        少し遅らせて背景(モーダル以外のbody子要素)をボカす
        WebAnimationAPIでは一括指定ができないためCSS3 Animationでやる
*/

// 引数に合わせてボカし用テキストを作って返す
function createBlurAnimationStyleText(_ref) {
    var _ref$blur = _ref.blur,
        blur = _ref$blur === undefined ? '1px' : _ref$blur,
        _ref$duration = _ref.duration,
        duration = _ref$duration === undefined ? 160 : _ref$duration,
        _ref$selector = _ref.selector,
        selector = _ref$selector === undefined ? '' : _ref$selector;

    if (_check.not.str(blur, selector) || _check.not.num(duration)) {
        throw new TypeError('Invalid arguments');
    }
    return '\n        body > *:not(' + selector + ') {\n            -webkit-animation-name: hoge;\n            -moz-animation-name: hoge;\n            -o-animation-name: hoge;\n            animation-name: hoge;\n            -webkit-animation-duration: ' + duration + 'ms;\n            -moz-animation-duration: ' + duration + 'ms;\n            -o-animation-duration: ' + duration + 'ms;\n            animation-duration: ' + duration + 'ms;\n            -webkit-animation-fill-mode: forwards;\n            -moz-animation-fill-mode: forwards;\n            -o-animation-fill-mode: forwards;\n            -webkit-animation-fill-mode: forwards;\n            -moz-animation-fill-mode: forwards;\n            -o-animation-fill-mode: forwards;\n            animation-fill-mode: forwards;\n            -webkit-animation-timing-function: ease-in;\n            -moz-animation-timing-function: ease-in;\n            -o-animation-timing-function: ease-in;\n            animation-timing-function: ease-in;\n        }\n\n        @-webkit-keyframes hoge {\n            from {\n                -webkit-filter: blur(0px);\n                        filter: blur(0px);\n            } to {\n                -webkit-filter: blur(' + blur + ');\n                        filter: blur(' + blur + ');\n            }\n        }\n        @-moz-keyframes hoge {\n                from {\n                    -webkit-filter: blur(0px);\n                            filter: blur(0px);\n                } to {\n                    -webkit-filter: blur(' + blur + ');\n                            filter: blur(' + blur + ');\n                }\n            }\n        @-o-keyframes hoge {\n                from {\n                    -webkit-filter: blur(0px);\n                            filter: blur(0px);\n                } to {\n                    -webkit-filter: blur(' + blur + ');\n                            filter: blur(' + blur + ');\n                }\n            }\n        @keyframes hoge {\n            from {\n                -webkit-filter: blur(0px);\n                        filter: blur(0px);\n            } to {\n                -webkit-filter: blur(' + blur + ');\n                        filter: blur(' + blur + ');\n            }\n        }\n    ';
}

var temp_cssText = void 0; // ボカす際に使ったテキストのキャッシュ

/*
    ボカす
        引数オブジェクトで挙動を設定できる
        option {
            blur: ボカす度合い、default "1px"
            duration: アニメーション開始前の待ち時間、default 160
            selector: ボカし対象から除外する要素のセレクタ、default ""
        }
*/
function blur(option) {
    temp_cssText = createBlurAnimationStyleText(option);
    _styleHandle2.default.addText(temp_cssText);
    return this;
}

// ボカし解除
function focus() {
    if (temp_cssText) {
        _styleHandle2.default.removeText(temp_cssText);
        temp_cssText = null;
    }
    return this;
}

exports.default = {
    hidden: hidden,
    view: view,
    focus: focus,
    blur: blur
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(10)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?modules!./style.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?modules!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)();
// imports


// module
exports.push([module.i, "/*\r\n\tCSS Modules\r\n*/\r\n\r\n/* bodyサイズをwindowまで縮小 */\r\n._2aur7e_TbRIQ1jgJAPW9gn {\r\n\theight: 100vm;\r\n\toverflow: hidden;\r\n}\r\n", ""]);

// exports
exports.locals = {
	"_body": "_2aur7e_TbRIQ1jgJAPW9gn"
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function () {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for (var i = 0; i < this.length; i++) {
			var item = this[i];
			if (item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ })
/******/ ]);
});