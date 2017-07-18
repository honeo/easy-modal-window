(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@honeo/await-event"), require("make-element"), require("@honeo/type-check"), require("./lib/events.js"), require("./lib/body-ctrl"), require("style-handle"));
	else if(typeof define === 'function' && define.amd)
		define(["@honeo/await-event", "make-element", "@honeo/type-check", "./lib/events.js", "./lib/body-ctrl", "style-handle"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("@honeo/await-event"), require("make-element"), require("@honeo/type-check"), require("./lib/events.js"), require("./lib/body-ctrl"), require("style-handle")) : factory(root["@honeo/await-event"], root["make-element"], root["@honeo/type-check"], root["./lib/events.js"], root["./lib/body-ctrl"], root["style-handle"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _awaitEvent = __webpack_require__(1);

	var _awaitEvent2 = _interopRequireDefault(_awaitEvent);

	var _makeElement = __webpack_require__(2);

	var _makeElement2 = _interopRequireDefault(_makeElement);

	var _typeCheck = __webpack_require__(3);

	var _events = __webpack_require__(4);

	var _bodyCtrl = __webpack_require__(5);

	var _bodyCtrl2 = _interopRequireDefault(_bodyCtrl);

	var _styleHandle = __webpack_require__(6);

	var _styleHandle2 = _interopRequireDefault(_styleHandle);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// Var
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

	// Modules
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
	        if (_typeCheck.is.str(colortext)) {
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
	        if (_typeCheck.is.bool(arg)) {
	            isBackgroundBlur = arg;
	        }
	    },
	    get isCloseOnBackgroundClick() {
	        return isCloseOnBackgroundClick;
	    },
	    set isCloseOnBackgroundClick(arg) {
	        if (_typeCheck.is.bool(arg)) {
	            isCloseOnBackgroundClick = arg;
	        }
	    },
	    get isCloseOnInsertedElement() {
	        return isCloseOnInsertedElement;
	    },
	    set isCloseOnInsertedElement(arg) {
	        if (_typeCheck.is.bool(arg)) {
	            isCloseOnInsertedElement = arg;
	        }
	    },
	    get isHideScrollbar() {
	        return isHideScrollbar;
	    },
	    set isHideScrollbar(arg) {
	        if (_typeCheck.is.bool(arg)) {
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
	    if (_typeCheck.is.str(item)) {
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
	    } else if (_typeCheck.not.element(item)) {
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
	        isHideScrollbar && _bodyCtrl2.default.hidden();

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
	        isBackgroundBlur && _bodyCtrl2.default.blur({ selector: '.' + obj.containerElement.className });

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

	    _bodyCtrl2.default.focus(); // ボカし解除、ボカしてなければ無反応
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

	        _bodyCtrl2.default.view(); // windowサイズ復元
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
/* 1 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

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
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ })
/******/ ])
});
;