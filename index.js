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
        easyじゃなくなってきたからeasy-を外したい。
        画面右上に☓ボタン。
        複数要素の挿入。
        Mobileだと✖ボタンの右下にスペースがない
*/

// Modules
import AwaitEvent from '@honeo/await-event';
import makeElement from 'make-element';
import {is, not} from '@honeo/type-check';
import {onOpen, onReplace, onClose} from './lib/events.js';
import bodyCtrl from './lib/body-ctrl.js';
import StyleHandle from 'style-handle';

// Var
const doc = document;
const head = doc.head;
const body = doc.body;
const duration_ms = 160; //アニメーション総時間
let isOpen = false; // 展開の状態、同期処理内で早めに切り替える、Promise#resolveのタイミングとは関係ない
let isCloseOnBackgroundClick = true; // 背景クリックでも閉じるかどうか

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
            const div = makeElement('div', {style: `
                min-height: 2.2rem;
                flex-grow: 50;
                flex-shrink: 0;
                text-align: right;
                cursor: default;
                user-select: none;
            `});
            // 子、ボタン代わり
            const div_closeButton = makeElement('div', '✕', {
                class: 'easy-modal-window-closeButton'
            });
            StyleHandle.addText(`
                .easy-modal-window-closeButton{
                    position: absolute;
                    right: 0;
                    padding: 0.3rem;
                    color: white;
                    font-size: 1.6rem;
                    user-select: none;
                    transition: 0.3s;
                }
                .easy-modal-window-closeButton:hover{
                    color: firebrick;
                    transition: 0.3s;
                }
            `);
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
            const div = makeElement('div', {style: `
                flex-grow: 50;
            `});
            this._space_bottom = div;
        }
        return this._space_bottom;
    },

    // 背景＆flexboxコンテナ
    get containerElement(){
        if( !this._containerElement ){
            const div = makeElement('div', {
                class: `easy-modal-window-${Date.now()}`,
                style: `
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    overflow: auto;
                    z-index: 1000;
            `});
            this._containerElement = div;
        }
        return this._containerElement;
    },

    // flexboxアイテム、中央寄せ用
    get centeringElement(){
        if( !this._centeringElement ){
            const div = makeElement('div', {
                style: `
                    max-width: 100%;
                    /* max-height: 100%; */
                    flex-shrink: 0;
            `});
            this._centeringElement = div;
        }
        return this._centeringElement;
    }
}

/*
    APIの入れ物
*/
const EasyModalWindow = {
    get isOpen(){
        return isOpen;
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

obj.containerElement.append( obj.space_top );
obj.containerElement.append( obj.centeringElement );
obj.containerElement.append( obj.space_bottom );

// 設定有効時、背景(container or centering)クリックで閉じる
obj.containerElement.addEventListener('click', (e)=>{
    if(isCloseOnBackgroundClick && e.target===obj.containerElement){
         close();
    }
}, false);



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

        bodyCtrl.blur({selector: `.${container.className}`}); // モーダル以外をボカす

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
    const {containerElement: container, centeringElement: centering} = obj;
    const item_old = centering.firstChild;
    return new Promise( (resolve, reject)=>{
        // 古いアイテムをフェードアウト
        const apObj_old = item_old.animate([{
            opacity: 1
        }, {
            opacity: 0
        }], {
            duration: duration_ms/1.5,
            fill: 'forwards'
        }).onfinish = resolve;
    }).then( (e)=>{
        // フェードアウト後にパージ
        item_old.remove();
        // 新アイテムを挿入してフェードイン
        centering.appendChild(item_new);
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

    const {containerElement: container, centeringElement: centering} = obj;
    const item = centering.firstChild;
    // コンテナをフェードアウト
    const container_apObj = container.animate([{
        background: 'rgba(0,0,0, 0.7)',
    }, {
        background: 'rgba(0,0,0, 0)',
    }], {
        duration: duration_ms,
        fill: 'forwards'
    });
    const container_promise = AwaitEvent(container_apObj, 'finish', false);

    // アイテムをフェードアウト
    const item_apObj = item.animate([{
        opacity: 1
    }, {
        opacity: 0
    }], {
        duration: duration_ms,
        fill: 'forwards'
    });
    const item_promise = AwaitEvent(item_apObj, 'finish', false);

    bodyCtrl.focus(); // ボカし解除
    isOpen = false;

    // 両フェードが終われば両要素をパージしてwindowサイズを戻してresolve
    return Promise.all([
        container_promise,
        item_promise
    ]).then( (evtArr)=>{
        container.remove();
        item.remove();
        bodyCtrl.view(); // windowサイズ復元
        // closeイベント
        EasyModalWindow::onClose({
            target: item,
            timeStamp: Date.now(),
            type: 'close'
        });
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
