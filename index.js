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
import AwaitEvent from '@honeo/await-event';
import makeElement from 'make-element';
import {is, not} from '@honeo/type-check';
import {onOpen, onReplace, onClose} from './lib/events.js';
import bodyCtrl from './lib/body-ctrl.js';
import StyleHandle from 'style-handle';

// Var
const ModuleName = 'easy-modal-window';
const doc = document;
const head = doc.head;
const body = doc.body;
const duration_ms = 160; //アニメーション総時間
let isOpen = false; // 展開の状態、同期処理内で早めに切り替える、Promise#resolveのタイミングとは関係ない
let isCloseOnBackgroundClick = true; // 背景クリックでも閉じるかどうか
let isBackgroundBlur = true; // 展開中に背景をボカすか
let insertedElement; // 外部から挿入中の要素

// Styleまとめ、本当はAutoPrefix→圧縮→CSS Module読み込みしたいが
const css_text = `
    /* DOM構造順 */

    .${ModuleName}-container {
        margin: 0;
        padding: 0;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        display: -webkit-box;
        display: -webkit-flex;
        display: -moz-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -webkit-flex-direction: column;
        -moz-box-orient: vertical;
        -moz-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-pack: justify;
        -webkit-justify-content: space-between;
        -moz-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        -webkit-box-align: center;
        -webkit-align-items: center;
        -moz-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-flex-shrink: 0;
        -ms-flex-negative: 0;
        flex-shrink: 0;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
        z-index: 1000;
    }

    .${ModuleName}-space_top {
        /* min-height: 2.2rem; */
        -webkit-box-flex: 50;
        -webkit-flex-grow: 50;
        -moz-box-flex: 50;
        -ms-flex-positive: 50;
        flex-grow: 50;
        -webkit-flex-shrink: 0;
        -ms-flex-negative: 0;
        flex-shrink: 0;
    }
    .${ModuleName}-space_top-closeButton {
        position: fixed;
        top: 1vh;
        right: 1vw;
        padding: 0.3rem;
        color: white;
        font-size: 1.6rem;
        cursor: default;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-transition: 0.3s;
        -o-transition: 0.3s;
        -moz-transition: 0.3s;
        transition: 0.3s;
    }
    .${ModuleName}-space_top-closeButton:hover {
        color: firebrick;
        transition: 0.3s;
    }

    .${ModuleName}-centering {
        max-width: 100%;
        /* max-height: 100%; */
        flex-shrink: 0;
    }

    .${ModuleName}-space_bottom {
        -webkit-box-flex: 50;
        -webkit-flex-grow: 50;
        -moz-box-flex: 50;
        -ms-flex-positive: 50;
        flex-grow: 50;
    }
`;

/*
    APIの入れ物
*/
const EasyModalWindow = {
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
    open,
    close,
    toggle
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
                class: `${ModuleName}-space_top`
            });
            // 子、ボタン代わり
            const div_closeButton = makeElement('div', '✕', {
                class: `${ModuleName}-space_top-closeButton`
            });
            div_closeButton.onclick = close;
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
                class: `${ModuleName}-space_bottom`
            });
            this._space_bottom = div;
        }
        return this._space_bottom;
    },

    // 背景＆flexboxコンテナ、本体要素
    get containerElement(){
        if( !this._containerElement ){
            const div = makeElement('div', {
                class: `${ModuleName}-container`
            });
            this._containerElement = div;

            div.append( obj.space_top );
            div.append( obj.centeringElement );
            div.append( obj.space_bottom );

            // 設定有効時、背景(container)クリックで閉じる、e.targetの確認を端折ると誤爆する
            div.addEventListener('click', (e)=>{
                isCloseOnBackgroundClick && e.target===div && close();
            }, false);
            // CSS適用
            StyleHandle.addText(css_text);
        }
        return this._containerElement;
    },

    // flexboxアイテム、中央寄せ用
    get centeringElement(){
        if( !this._centeringElement ){
            const div = makeElement('div', {
                class: `${ModuleName}-centering`
            });
            this._centeringElement = div;
        }
        return this._centeringElement;
    }

}


/*
    引数要素でモーダルウィンドウを開く
        既に開いていれば中身の要素を入れ替える
            入れ替えも何かアニメーションしたい
        promiseを返す
        コンテナとアイテムのフェードをeasingでズラすと目に悪い
*/
function open(item){
    if( not.element(item) ){
        throw new TypeError(`invalid argument`);
    }
    // 既に開いていれば入れ替える
    if( isOpen ){
        return replace(item);
    }

    return new Promise( (resolve, reject)=>{

        const {containerElement: container, centeringElement: centering} = obj;
        body.appendChild(container);
        centering.appendChild(item);

        // 挿入中要素メモ
        insertedElement = item;

        // body要素をheight100%に縮小して非表示部分を隠す
        bodyCtrl.hidden();

        // モーダルウィンドウをフェードイン
        const container_apObj = container.animate([{
            background: 'rgba(0,0,0, 0)',
        }, {
            background: 'rgba(0,0,0, 0.7)',
        }], {
            duration: duration_ms,
            fill: 'forwards'
        });

        // 中身をフェードイン
        const item_apObj = item.animate([{
            opacity: 0,
        }, {
            opacity: 1,
        }], {
            duration: duration_ms,
            fill: 'forwards'
        });

        // 設定有効時はモーダル以外をボカす
        isBackgroundBlur && bodyCtrl.blur({selector: `.${container.className}`});

        // アニメーション終了時にresolve、無名関数を挟んでeventを渡さない
        container_apObj.onfinish = (e)=>{
            resolve();
            EasyModalWindow::onOpen({
                target: item,
                timeStamp: Date.now(),
                type: 'open'
            });
        }
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
        // フェードアウト後にパージ
        insertedElement.remove();
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
        background: 'rgba(0,0,0, 0.7)',
    }, {
        background: 'rgba(0,0,0, 0)',
    }], {
        duration: duration_ms,
        fill: 'forwards'
    });
    const container_promise = AwaitEvent(container_apObj, 'finish', false);

    // アイテムをフェードアウト
    const insertedElement_apObj = insertedElement.animate([{
        opacity: 1
    }, {
        opacity: 0
    }], {
        duration: duration_ms,
        fill: 'forwards'
    });
    const insertedElement_promise = AwaitEvent(insertedElement_apObj, 'finish', false);

    bodyCtrl.focus(); // ボカし解除、ボカしてなければ無反応
    isOpen = false;

    // 両フェードが終われば両要素をパージしてwindowサイズを戻してresolve
    return Promise.all([
        container_promise,
        insertedElement_promise
    ]).then( (evtArr)=>{
        obj.containerElement.remove();
        insertedElement.remove();
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
