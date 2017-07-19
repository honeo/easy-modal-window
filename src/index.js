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
import AwaitEvent from '@honeo/await-event';
import makeElement from 'make-element';
import {is, not, any} from '@honeo/check';
// Lib
import {onOpen, onReplace, onClose} from './lib/events.js';
import bodyCtrl from './lib/body-ctrl/index.js';
// css modules
import styles from './style.css';

// Var
const doc = document;
const head = doc.head;
const body = doc.body;
const duration_ms = 160; //アニメーション総時間
const weakMap = new WeakMap(); // selectorから挿入した要素:挿入地点メモのダミー要素
let isOpen = false; // 展開の状態、同期処理内で早めに切り替える、Promise#resolveのタイミングとは関係ない
let isBackgroundBlur = true; // 展開中に背景をボカすか
let isCloseOnBackgroundClick = true; // 背景クリックでも閉じるかどうか
let isCloseOnInsertedElement = false; // 挿入した要素のクリックでも閉じるか
let isHideScrollbar = true; // 展開中にbodyのスクロールバーを隠すか
let insertedElement; // 外部から挿入中の要素
let backgroundColor = 'rgba(0,0,0, 0.72)'; // 背景色

/*
    APIの入れ物
        設定値はプロパティ用オブジェクトを作って変数とまとめたいが
*/
const EasyModalWindow = {
    get backgroundColor(){
        return backgroundColor;
    },
    set backgroundColor(colortext){
        if( is.str(colortext) ){
            backgroundColor = colortext;
        }
    },
    get insertedElement(){
        return insertedElement;
    },
    get isOpen(){
        return isOpen;
    },
    get isBackgroundBlur(){
        return isBackgroundBlur;
    },
    set isBackgroundBlur(arg){
        if( is.bool(arg) ){
            isBackgroundBlur = arg;
        }
    },
    get isCloseOnBackgroundClick(){
        return isCloseOnBackgroundClick;
    },
    set isCloseOnBackgroundClick(arg){
        if( is.bool(arg) ){
            isCloseOnBackgroundClick = arg;
        }
    },
    get isCloseOnInsertedElement(){
        return isCloseOnInsertedElement;
    },
    set isCloseOnInsertedElement(arg){
        if( is.bool(arg) ){
            isCloseOnInsertedElement = arg;
        }
    },
    get isHideScrollbar(){
        return isHideScrollbar;
    },
    set isHideScrollbar(arg){
        if( is.bool(arg) ){
            isHideScrollbar = arg;
        }
    },
    open,
    close,
    toggle,
    debug: false
}

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
const obj = {
    // 上部スペースと✕ボタン
    get space_top(){
        if( !this._space_top ){
            // 親
            const div = makeElement('div', {
                class: styles.space_top
            });
            // 子、ボタン代わり
            const div_closeButton = makeElement('div', '✕', {
                class: styles["space_top-closeButton"]
            });
            div.appendChild(div_closeButton);
            this._space_top = div;

        }
        return this._space_top;
    },

    // 下部スペース
    get space_bottom(){
        if( !this._space_bottom ){
            // 親
            const div = makeElement('div', {
                class: styles.space_bottom
            });
            this._space_bottom = div;
        }
        return this._space_bottom;
    },

    // 背景＆flexboxコンテナ、本体要素
    get containerElement(){
        if( !this._containerElement ){
            EasyModalWindow.debug && console.log(`EasyModalWindow: create containerElement`);
            const div = makeElement('div', {
                class: styles.container
            });
            this._containerElement = div;

            div.append( obj.space_top );
            div.append( obj.centeringElement );
            div.append( obj.space_bottom );

            // 閉じる設定
            window.addEventListener('click', (e)=>{
                if( isCloseOnBackgroundClick &&  e.target===div){
                    // 設定有効なら背景クリック時
                    close();
                }else if( e.target.className===styles["space_top-closeButton"] ){
                    // 閉じるボタン
                    close();
                }else if( isCloseOnInsertedElement && (e.target===insertedElement||insertedElement.contains(e.target)) ){
                    // 設定有効なら挿入した要素かその子孫
                    close();
                }
            }, true);
            // CSS適用
        }
        return this._containerElement;
    },

    // flexboxアイテム、中央寄せ用
    get centeringElement(){
        if( !this._centeringElement ){
            const div = makeElement('div', {
                class: styles.centering
            });
            this._centeringElement = div;
        }
        return this._centeringElement;
    },

    // selectorから挿入した要素と入れ替えで置いておくやつ
    get dummyElement(){
        if( !this._dummyElement ){
            this._dummyElement = makeElement('span', {
                class: styles.dummy,
                style: `display: none;`
            });
        }
        return this._dummyElement;
    }
}


/*
    引数の要素orセレクタと一致する要素をモーダルウィンドウで開く
        既に開いていれば中身の要素を入れ替える
        なるべく素早く内容が確認できるように挿入要素のアニメーションは短く

        引数
            1: element or "selector"
                elementならそのまま使う。
                文字列ならselectorとして扱い検索する。
                    一致する要素を持つselector文字列でない場合はrejectする。
        返り値
            promise
                展開終了時に解決する。
*/
async function open(item){
    // Validation, 一致する要素のあるselector文字列か要素のみ
    if( is.str(item) ){
        const element = doc.querySelector(item);
        if( element ){
            // 対になるダミー要素を作って入れ替え
            const dummy = obj.dummyElement.cloneNode(true);
            weakMap.set(element, dummy);
            element.replaceWith(dummy);
            item = element;
        }else{
            return Promise.reject(`${item}: not found`);
        }
    }else if( not.element(item) ){
        throw new TypeError(`Invalid argument`);
    }

    // 既に開いていれば入れ替える
    if( isOpen ){
        return replace(item);
    }

    body.appendChild(obj.containerElement);
    obj.centeringElement.appendChild(item);

    // 挿入中要素メモ
    insertedElement = item;

    // 設定有効時、body要素をheight100%に縮小して非表示部分を隠す
    isHideScrollbar && bodyCtrl.hidden();

    // モーダルウィンドウ（背景）をフェードイン、挿入要素より遅らせる
    const container_apObj = obj.containerElement.animate([{
        background: 'rgba(0,0,0, 0)',
    }, {
        background: backgroundColor,
    }], {
        duration: 334,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // 中身をフェードイン
    const item_apObj = item.animate([{
        opacity: 0,
    }, {
        opacity: 1,
    }], {
        duration: duration_ms,
        easing: 'ease-out',
        fill: 'none'
    });

    // 設定有効時はモーダル以外をボカす
    isBackgroundBlur && bodyCtrl.blur({
        duration: duration_ms,
        selector: `.${obj.containerElement.className}`}
    );

    // アニメーション終了時にresolve
    await new Promise( (resolve, reject)=>{
        container_apObj.onfinish = (e)=>{
            resolve();
            EasyModalWindow::onOpen({
                target: item,
                timeStamp: Date.now(),
                type: 'open'
            });
        }
    });
    isOpen = true;
}

/*
    中身を入れ替える
        旧アイテムをフェードアウト＞新アイテムをフェードイン＞resolve
            OUT,INを両方行うためアニメーション時間はそれぞれ2/3に短縮
        promiseを返す
        openから呼び出して使う
            引数チェックはopenでやったから省略
*/
function replace(item_new){
    return new Promise( (resolve, reject)=>{
        // 古いアイテムをフェードアウト
        const apObj_old = insertedElement.animate([{
            opacity: 1
        }, {
            opacity: 0
        }], {
            duration: duration_ms/1.5,
            fill: 'forwards'
        }).onfinish = resolve;
    }).then( (e)=>{
        // フェードアウト後にパージ、selectorなら対になるダミー要素があるから入れ替える
        if( weakMap.has(insertedElement) ){
            const dummy = weakMap.get(insertedElement);
            dummy.replaceWith(insertedElement);
        }else{
            insertedElement.remove();
        }

        // 新アイテムを挿入して変数上書きしてフェードイン
        obj.centeringElement.appendChild(item_new);
        insertedElement = item_new;
        const item_apObj = item_new.animate([{
            opacity: 0,
        }, {
            opacity: 1,
        }], {
            duration: duration_ms/1.5,
            fill: 'forwards'
        });
        return AwaitEvent(item_apObj, 'finish', false);
    }).then( (e)=>{
        EasyModalWindow::onReplace({
            target: item_new,
            timeStamp: Date.now(),
            type: 'replace'
        });
    })
}

/*
    展開中なら閉じる
        promiseを返す
        展開中ならコンテナ・アイテムのフェードアウトを待ってresolve
        展開中でなければ即resolve
        すぐ操作できるように閉じる際は素早く
*/
function close(){
    if( !isOpen ){
        EasyModalWindow::onClose({
            target: null,
            timeStamp: Date.now(),
            type: 'close'
        });
        return Promise.resolve();
    }

    // コンテナをフェードアウト
    const container_apObj = obj.containerElement.animate([{
        background: backgroundColor,
    }, {
        background: 'rgba(0,0,0, 0)',
    }], {
        duration: duration_ms,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
    const container_promise = AwaitEvent(container_apObj, 'finish', false);

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

    bodyCtrl.focus(); // ボカし解除、ボカしてなければ無反応
    isOpen = false;

    // 両フェードアウトが終わればパージしてwindowサイズを戻してresolve
    return Promise.all([
        container_promise
        //,insertedElement_promise
    ]).then( (evtArr)=>{

        obj.containerElement.remove();

        // パージ、selectorなら対になるダミー要素があるから入れ替える
        if( weakMap.has(insertedElement) ){
            const dummy = weakMap.get(insertedElement);
            dummy.replaceWith(insertedElement);
        }else{
            insertedElement.remove();
        }

        bodyCtrl.view(); // windowサイズ復元
        // closeイベント
        EasyModalWindow::onClose({
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
function toggle(element){
    return isOpen ?
        close():
        open(element);
}

export default EasyModalWindow;
