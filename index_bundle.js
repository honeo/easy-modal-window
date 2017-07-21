(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@honeo/check"), require("@honeo/await-event"), require("style-handle"), require("make-element"));
	else if(typeof define === 'function' && define.amd)
		define(["@honeo/check", "@honeo/await-event", "style-handle", "make-element"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("@honeo/check"), require("@honeo/await-event"), require("style-handle"), require("make-element")) : factory(root["@honeo/check"], root["@honeo/await-event"], root["style-handle"], root["make-element"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_9__, __WEBPACK_EXTERNAL_MODULE_13__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

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
/* 2 */
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


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*
	共通で使い回すオブジェクト
*/
/* harmony default export */ __webpack_exports__["a"] = ({
	backgroundColor: 'rgba(0,0,0, 0.72)', // 背景色
	duration_ms: 160, // アニメーション総時間
	insertedElement: null, // 外部から挿入中の要素
	isBackgroundBlur: true, // 展開中に背景をボカすか
	isCloseOnBackgroundClick: true, // 背景クリックでも閉じるかどうか
	isCloseOnInsertedElement: false, // 挿入した要素のクリックでも閉じるか
	isHideScrollbar: true, // 展開中にbodyのスクロールバーを隠すか
	isOpen: false, // 展開の状態
	weakmap: new WeakMap() // 挿入した要素:挿入地点メモのダミー要素
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js??ref--1-1!./style.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js??ref--1-1!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__honeo_await_event__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__honeo_await_event___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__honeo_await_event__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__honeo_check__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__lib_events_js__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__lib_body_ctrl_index_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__elements_js__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__share_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__style_css__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__style_css__);


/*
    引数の要素orセレクタと一致する要素をモーダルウィンドウで開く
        既に開いていれば中身の要素を入れ替える
        なるべく素早く内容が確認できるように挿入要素のアニメーションは短く

        引数
            1: element or "selector"
                elementならそのまま使う。
                文字列ならselectorとして一致する要素を取得する。
        返り値
            promise
                展開終了時に解決する。
*/
var open = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(_item) {
        var item, dummy, container_apObj;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        // 要素ならそのまま、文字列ならselectorとしてelementを探す
                        item = __WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].str(_item) ? doc.querySelector(_item) : _item;

                        // Validation

                        if (!__WEBPACK_IMPORTED_MODULE_1__honeo_check__["not"].element(item)) {
                            _context.next = 3;
                            break;
                        }

                        throw new TypeError('Invalid argument');

                    case 3:
                        if (!__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isOpen) {
                            _context.next = 5;
                            break;
                        }

                        return _context.abrupt('return', replace(item));

                    case 5:

                        body.appendChild(__WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].container);
                        // 親ノードがあれば位置記憶用のダミーを挿入
                        if (item.parentNode) {
                            dummy = __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].dummy;

                            item.after(dummy);
                            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].weakmap.set(item, dummy);
                        }
                        __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].centering.appendChild(item);

                        // 挿入中要素メモ
                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement = item;

                        // 設定有効時、body要素をheight100%に縮小して非表示部分を隠す
                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isHideScrollbar && __WEBPACK_IMPORTED_MODULE_3__lib_body_ctrl_index_js__["a" /* default */].hidden();

                        // モーダルウィンドウ（背景）をフェードイン、挿入要素より遅らせる
                        container_apObj = __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].container.animate([{
                            background: 'rgba(0,0,0, 0)',
                            opacity: 0
                        }, {
                            background: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].backgroundColor,
                            opacity: 1
                        }], {
                            duration: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].duration_ms * 2,
                            easing: 'ease-out',
                            fill: 'forwards'
                        });

                        // 設定有効時はモーダル以外をボカす

                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isBackgroundBlur && __WEBPACK_IMPORTED_MODULE_3__lib_body_ctrl_index_js__["a" /* default */].blur({
                            duration: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].duration_ms * 2,
                            selector: '.' + __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].container.className });

                        // アニメーション終了時にopen発火、resolve
                        _context.next = 14;
                        return new Promise(function (resolve, reject) {
                            container_apObj.onfinish = function (e) {
                                __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isOpen = true;
                                resolve();
                                __WEBPACK_IMPORTED_MODULE_2__lib_events_js__["b" /* onOpen */].call(EasyModalWindow, {
                                    target: item,
                                    timeStamp: Date.now(),
                                    type: 'open'
                                });
                            };
                        });

                    case 14:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function open(_x) {
        return _ref.apply(this, arguments);
    };
}();

/*
    中身を入れ替える
        旧アイテムをフェードアウト＞新アイテムをフェードイン＞resolve
            OUT,INを両方行うためアニメーション時間はそれぞれ2/3に短縮
        openから呼び出して使う
            引数チェックはopenでやるから省略
        不具合
            Firefoxでチラつく
                挿入中コンテンツを透明化→透過後にremove→新コンテンツ挿入とするとチラチラする。
                fill:"none"時に、スタイル初期化を描画してからfinishイベントが発火するっぽい。
                対策としてcenteringを透明化→コンテンツ入れ替え→透明化解除としている。


        引数
            1: element
        返り値
            promise
                入れ替え後に解決する。
*/


var replace = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(item_new) {
        var apObj1, dummy, apObj2;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:

                        // 古いアイテムをフェードアウト
                        apObj1 = __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].centering.animate([{
                            opacity: 1
                        }, {
                            opacity: 0
                        }], {
                            duration: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].duration_ms / 2,
                            fill: 'forwards'
                        });
                        _context2.next = 3;
                        return __WEBPACK_IMPORTED_MODULE_0__honeo_await_event___default()(apObj1, 'finish', false);

                    case 3:

                        // フェードアウト後にパージ、対になるダミー要素があれば入れ替える
                        if (__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].weakmap.has(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement)) {
                            dummy = __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].weakmap.get(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement);

                            dummy.replaceWith(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement);
                        } else {
                            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement.remove();
                        }

                        // 新アイテムを挿入して変数上書きしてフェードイン
                        __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].centering.appendChild(item_new);
                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement = item_new;
                        apObj2 = __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].centering.animate([{
                            opacity: 0
                        }, {
                            opacity: 1
                        }], {
                            duration: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].duration_ms / 2,
                            fill: 'forwards'
                        });
                        _context2.next = 9;
                        return __WEBPACK_IMPORTED_MODULE_0__honeo_await_event___default()(apObj2, 'finish', false);

                    case 9:

                        __WEBPACK_IMPORTED_MODULE_2__lib_events_js__["c" /* onReplace */].call(EasyModalWindow, {
                            target: item_new,
                            timeStamp: Date.now(),
                            type: 'replace'
                        });

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function replace(_x2) {
        return _ref2.apply(this, arguments);
    };
}();

/*
    展開中なら閉じる
        展開中ならコンテナ・アイテムのフェードアウトを待ってresolve
        展開中でなければ即resolve
        すぐ操作できるように閉じる際は素早く

        引数
            なし
        返り値
            promise
                閉じた後に解決する。

*/


var close = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var _context4;

        var _context3, container_apObj, dummy;

        return regeneratorRuntime.wrap(function _callee3$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        if (__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isOpen) {
                            _context5.next = 3;
                            break;
                        }

                        (_context3 = __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].EasyModalWindow, __WEBPACK_IMPORTED_MODULE_2__lib_events_js__["a" /* onClose */]).call(_context3, {
                            target: null,
                            timeStamp: Date.now(),
                            type: 'close'
                        });
                        return _context5.abrupt('return');

                    case 3:

                        // コンテナをフェードアウト
                        container_apObj = __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].container.animate([{
                            background: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].backgroundColor,
                            opacity: 1
                        }, {
                            background: 'rgba(0,0,0, 0)',
                            opacity: 0
                        }], {
                            duration: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].duration_ms,
                            easing: 'ease-in-out',
                            fill: 'forwards'
                        });


                        __WEBPACK_IMPORTED_MODULE_3__lib_body_ctrl_index_js__["a" /* default */].focus(); // ボカし解除、ボカしてなければ無反応
                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isOpen = false;

                        // フェードアウトが終わればパージしてwindowサイズを戻す
                        _context5.next = 8;
                        return __WEBPACK_IMPORTED_MODULE_0__honeo_await_event___default()(container_apObj, 'finish', false);

                    case 8:
                        __WEBPACK_IMPORTED_MODULE_4__elements_js__["a" /* default */].container.remove();

                        // 展開中の要素をパージ、対になるダミー要素があれば入れ替える
                        if (__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].weakmap.has(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement)) {
                            dummy = __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].weakmap.get(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement);

                            dummy.replaceWith(__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement);
                        } else {
                            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement.remove();
                        }

                        __WEBPACK_IMPORTED_MODULE_3__lib_body_ctrl_index_js__["a" /* default */].view(); // windowサイズ復元
                        // closeイベント
                        (_context4 = __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].EasyModalWindow, __WEBPACK_IMPORTED_MODULE_2__lib_events_js__["a" /* onClose */]).call(_context4, {
                            target: __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement,
                            timeStamp: Date.now(),
                            type: 'close'
                        });
                        // 挿入中メモ削除
                        __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement = null;

                    case 13:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee3, this);
    }));

    return function close() {
        return _ref3.apply(this, arguments);
    };
}();

/*
    トグル

        引数
            1...: なんでも
                そのままclose, openに渡す
        返り値
            promise
*/


var toggle = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        return _context6.abrupt('return', __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isOpen ? close.apply(undefined, _args4) : open.apply(undefined, _args4));

                    case 1:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee4, this);
    }));

    return function toggle() {
        return _ref4.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/*

*/

// Mod


// Local


 // 表示用要素

// css modules


// Var
var doc = document;
var head = doc.head;
var body = doc.body;

/*
    APIの入れ物
        設定値はプロパティ用オブジェクトを作って変数とまとめたいが
*/
var EasyModalWindow = {
    get backgroundColor() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].backgroundColor;
    },
    set backgroundColor(colortext) {
        if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].str(colortext)) {
            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].backgroundColor = colortext;
        }
    },
    get insertedElement() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].insertedElement;
    },
    get isOpen() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].share.isOpen;
    },
    get isBackgroundBlur() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isBackgroundBlur;
    },
    set isBackgroundBlur(arg) {
        if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].bool(arg)) {
            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isBackgroundBlur = arg;
        }
    },
    get isCloseOnBackgroundClick() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isCloseOnBackgroundClick;
    },
    set isCloseOnBackgroundClick(arg) {
        if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].bool(arg)) {
            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isCloseOnBackgroundClick = arg;
        }
    },
    get isCloseOnInsertedElement() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isCloseOnInsertedElement;
    },
    set isCloseOnInsertedElement(arg) {
        if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].bool(arg)) {
            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isCloseOnInsertedElement = arg;
        }
    },
    get isHideScrollbar() {
        return __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isHideScrollbar;
    },
    set isHideScrollbar(arg) {
        if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["is"].bool(arg)) {
            __WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].isHideScrollbar = arg;
        }
    },
    open: open,
    close: close,
    toggle: toggle,
    debug: false
};
__WEBPACK_IMPORTED_MODULE_5__share_js__["a" /* default */].EasyModalWindow = EasyModalWindow;

/* harmony default export */ __webpack_exports__["default"] = (EasyModalWindow);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return onOpen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return onReplace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return onClose; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__honeo_check__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__honeo_check___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__honeo_check__);
/*
    簡易イベント実装
        モジュールオブジェクトにlistenerがあれば実行する
        this = モジュールオブジェクト
*/

// Modules


function onOpen(e) {
    __WEBPACK_IMPORTED_MODULE_0__honeo_check__["is"].func(this.onopen) && this.onopen(e);
}

function onReplace(e) {
    __WEBPACK_IMPORTED_MODULE_0__honeo_check__["is"].func(this.onreplace) && this.onreplace(e);
}

function onClose(e) {
    __WEBPACK_IMPORTED_MODULE_0__honeo_check__["is"].func(this.onclose) && this.onclose(e);
}



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_style_handle__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_style_handle___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_style_handle__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__honeo_check__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_css__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__style_css__);
/*
    bodyに対してあれこれ
        全て自身を返す
        bodyサイズを変更・解除
            body要素をheight100%に縮小して非表示部分を隠す
        全ての要素をボカす
            引数オブジェクトで除外するselectorとアニメーション秒数を指定する。
*/

// Modules


 // CSS Modules

// Var
var doc = document;
var body = doc.body;
var debug = false;

// bodyサイズをwindow100%に縮小
function hidden() {
    debug && console.log('hidden');
    body.classList.add(__WEBPACK_IMPORTED_MODULE_2__style_css___default.a._body);
    return this;
}

// bodyサイズの縮小を解除
function view() {
    debug && console.log('view');
    body.classList.remove(__WEBPACK_IMPORTED_MODULE_2__style_css___default.a._body);
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

    if (__WEBPACK_IMPORTED_MODULE_1__honeo_check__["not"].str(blur, selector) || __WEBPACK_IMPORTED_MODULE_1__honeo_check__["not"].num(duration)) {
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
    __WEBPACK_IMPORTED_MODULE_0_style_handle___default.a.addText(temp_cssText);
    return this;
}

// ボカし解除
function focus() {
    if (temp_cssText) {
        __WEBPACK_IMPORTED_MODULE_0_style_handle___default.a.removeText(temp_cssText);
        temp_cssText = null;
    }
    return this;
}

/* harmony default export */ __webpack_exports__["a"] = ({
    hidden: hidden,
    view: view,
    focus: focus,
    blur: blur
});

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_9__;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(11);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(2)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js??ref--1-1!./style.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js??ref--1-1!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, "/*\r\n\tCSS Modules\r\n*/\r\n\r\n/* bodyサイズをwindowまで縮小 */\r\n._2aur7e_TbRIQ1jgJAPW9gn {\r\n\theight: 100%;\r\n\theight: 100vm;\r\n\toverflow: hidden;\r\n}\r\n", ""]);

// exports
exports.locals = {
	"_body": "_2aur7e_TbRIQ1jgJAPW9gn"
};

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_make_element__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_make_element___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_make_element__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__honeo_check___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__honeo_check__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__share_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__style_css__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__style_css__);
/*
    各要素への参照を持つオブジェクト
        参照時に要素がなければ作る

    構造
        <container> FlexContainer
		    <space_top> FlexItem
            <centering> FlexItem
				Contents
            <space_bottom> FlexItem
*/

// Mod


// Local

// css modules


var elements = {

    // ✕ボタン
    get close() {
        if (!this._close) {
            this._close = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('div', '✕', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.close
            });
        }
        return this._close;
    },

    // 上部スペース、✕ボタンが入る
    get space_top() {
        if (!this._space_top) {
            // 親
            var div = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('div', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.space_top
            });
            // ✕ボタンをIN
            div.append(this.close);
            this._space_top = div;
        }
        return this._space_top;
    },

    // 下部スペース
    get space_bottom() {
        if (!this._space_bottom) {
            // 親
            var div = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('div', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.space_bottom
            });
            this._space_bottom = div;
        }
        return this._space_bottom;
    },

    // 背景＆flexboxコンテナ、本体要素
    get container() {
        var _this = this;

        if (!this._container) {
            var div = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('div', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.container
            });
            this._container = div;

            div.append(elements.space_top, elements.centering, elements.space_bottom);

            window.addEventListener('click', function (e) {
                // 何れかの条件と一致で閉じる
                __WEBPACK_IMPORTED_MODULE_1__honeo_check__["any"].true(
                // 設定有効なら背景クリック時
                __WEBPACK_IMPORTED_MODULE_2__share_js__["a" /* default */].isCloseOnBackgroundClick && e.target === div,
                // 閉じるボタン
                e.target === _this.close,
                // 設定有効なら挿入した要素かその子孫
                __WEBPACK_IMPORTED_MODULE_2__share_js__["a" /* default */].isCloseOnInsertedElement && (e.target === __WEBPACK_IMPORTED_MODULE_2__share_js__["a" /* default */].insertedElement || __WEBPACK_IMPORTED_MODULE_2__share_js__["a" /* default */].insertedElement.contains(e.target))) && __WEBPACK_IMPORTED_MODULE_2__share_js__["a" /* default */].EasyModalWindow.close();
            }, true);
            // CSS適用
        }
        return this._container;
    },

    // flexboxアイテム、中央寄せ用
    get centering() {
        if (!this._centering) {
            var div = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('div', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.centering
            });
            this._centering = div;
        }
        return this._centering;
    },

    // 挿入した要素と入れ替えで置いておくやつ
    get dummy() {
        if (!this._dummy) {
            this._dummy = __WEBPACK_IMPORTED_MODULE_0_make_element___default()('span', {
                class: __WEBPACK_IMPORTED_MODULE_3__style_css___default.a.dummy,
                style: 'display: none;'
            });
        }
        return this._dummy;
    }
};

/* harmony default export */ __webpack_exports__["a"] = (elements);

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)();
// imports


// module
exports.push([module.i, "/*\r\n\tDOM構造順\r\n*/\r\n\r\n.Kj81HFlmcCeAV0rvkpU13,\r\n._1aiuL62n-Dh9D22PoJk7Fs,\r\n.ZJSTons1k_f_oN--cGZob,\r\n._1hb7ExsIALuP1olhfjTOT9,\r\n.UBR9LUvtO4Tlejrq4rDtG {\r\n\tmargin: 0;\r\n\tpadding: 0;\r\n\t-webkit-box-sizing: border-box;\r\n\t-moz-box-sizing: border-box;\r\n\tbox-sizing: border-box;\r\n}\r\n\r\n.Kj81HFlmcCeAV0rvkpU13 {\r\n\tdisplay: -webkit-box;\r\n\tdisplay: -webkit-flex;\r\n\tdisplay: -moz-box;\r\n\tdisplay: -ms-flexbox;\r\n\tdisplay: flex;\r\n\t-webkit-box-orient: vertical;\r\n\t-webkit-box-direction: normal;\r\n\t-webkit-flex-direction: column;\r\n\t-moz-box-orient: vertical;\r\n\t-moz-box-direction: normal;\r\n\t-ms-flex-direction: column;\r\n\tflex-direction: column;\r\n\t-webkit-box-pack: justify;\r\n\t-webkit-justify-content: space-between;\r\n\t-moz-box-pack: justify;\r\n\t-ms-flex-pack: justify;\r\n\tjustify-content: space-between;\r\n\t-webkit-box-align: center;\r\n\t-webkit-align-items: center;\r\n\t-moz-box-align: center;\r\n\t-ms-flex-align: center;\r\n\talign-items: center;\r\n\t-webkit-flex-shrink: 0;\r\n\t-ms-flex-negative: 0;\r\n\tflex-shrink: 0;\r\n\tposition: fixed;\r\n\ttop: 0;\r\n\tbottom: 0;\r\n\tleft: 0;\r\n\tright: 0;\r\n\toverflow: auto;\r\n\tz-index: 1000;\r\n}\r\n\r\n._1aiuL62n-Dh9D22PoJk7Fs {\r\n\t/* min-height: 2.2rem; */\r\n\t-webkit-box-flex: 50;\r\n\t-webkit-flex-grow: 50;\r\n\t-moz-box-flex: 50;\r\n\t-ms-flex-positive: 50;\r\n\tflex-grow: 50;\r\n\t-webkit-flex-shrink: 0;\r\n\t-ms-flex-negative: 0;\r\n\tflex-shrink: 0;\r\n}\r\n.ZJSTons1k_f_oN--cGZob {\r\n\tposition: fixed;\r\n\ttop: 1%; top: 1vh;\r\n\tright: 1%; right: 1vw;\r\n\tpadding: 0.3rem;\r\n\tcolor: white;\r\n\tfont-size: 1.6rem;\r\n\tcursor: default;\r\n\t-webkit-user-select: none;\r\n\t-moz-user-select: none;\r\n\t-ms-user-select: none;\r\n\tuser-select: none;\r\n\t-webkit-transition: 0.3s;\r\n\t-o-transition: 0.3s;\r\n\t-moz-transition: 0.3s;\r\n\ttransition: 0.3s;\r\n}\r\n.ZJSTons1k_f_oN--cGZob:hover {\r\n\tcolor: firebrick;\r\n\ttransition: 0.3s;\r\n}\r\n\r\n._1hb7ExsIALuP1olhfjTOT9 {\r\n\tmax-width: 100%;\r\n\t/* max-height: 100%; */\r\n\tflex-shrink: 0;\r\n}\r\n\r\n.UBR9LUvtO4Tlejrq4rDtG {\r\n\t-webkit-box-flex: 50;\r\n\t-webkit-flex-grow: 50;\r\n\t-moz-box-flex: 50;\r\n\t-ms-flex-positive: 50;\r\n\tflex-grow: 50;\r\n}\r\n", ""]);

// exports
exports.locals = {
	"container": "Kj81HFlmcCeAV0rvkpU13",
	"space_top": "_1aiuL62n-Dh9D22PoJk7Fs",
	"close": "ZJSTons1k_f_oN--cGZob",
	"centering": "_1hb7ExsIALuP1olhfjTOT9",
	"space_bottom": "UBR9LUvtO4Tlejrq4rDtG"
};

/***/ })
/******/ ]);
});