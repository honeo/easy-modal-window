/*
    easyじゃなくなってきたらeasy-を外したい
        isRunning変数で展開・閉じる処理中の利用は破棄しようかと思ったが
        即やっぱやめ出来ないと操作のストレスになりそうだからやめた
*/

// Modules
import AwaitEvent from '@honeo/await-event';
import makeElement from 'make-element';
import {is, not} from '@honeo/type-check';
import StyleHandle from 'style-handle';

// Var
const doc = document;
const head = doc.head;
const body = doc.body;
const duration_ms = 160; //アニメーション総時間
const blur_value = '1px'; //blur()の値
let isOpen = false; // 展開の状態、同期処理内で早めに切り替える、Promise#resolveのタイミングとは関係ない

// 試験的、表示中にbodyのサイズを変更
const css_body = `
    body {
        height: 100vm;
        overflow: hidden;
    }
`;

/*
    一括版
        少し遅らせて背景(モーダル以外のbody子要素)をボカす
        WebAnimationAPIでは一括指定ができない
*/
const css_animation = `
    body > *:not(.easy-modal-window) {
        -webkit-animation-name: hoge;
        -moz-animation-name: hoge;
        -o-animation-name: hoge;
        animation-name: hoge;
        -webkit-animation-duration: ${duration_ms}ms;
        -moz-animation-duration: ${duration_ms}ms;
        -o-animation-duration: ${duration_ms}ms;
        animation-duration: ${duration_ms}ms;
        -webkit-animation-fill-mode: forwards;
        -moz-animation-fill-mode: forwards;
        -o-animation-fill-mode: forwards;
        -webkit-animation-fill-mode: forwards;
        -moz-animation-fill-mode: forwards;
        -o-animation-fill-mode: forwards;
        animation-fill-mode: forwards;
        -webkit-animation-timing-function: ease-in;
        -moz-animation-timing-function: ease-in;
        -o-animation-timing-function: ease-in;
        animation-timing-function: ease-in;
    }

    @-webkit-keyframes hoge {
        from {
            -webkit-filter: blur(0px);
                    filter: blur(0px);
        } to {
            -webkit-filter: blur(${blur_value});
                    filter: blur(${blur_value});
        }
    }
    @-moz-keyframes hoge {
            from {
                -webkit-filter: blur(0px);
                        filter: blur(0px);
            } to {
                -webkit-filter: blur(${blur_value});
                        filter: blur(${blur_value});
            }
        }
    @-o-keyframes hoge {
            from {
                -webkit-filter: blur(0px);
                        filter: blur(0px);
            } to {
                -webkit-filter: blur(${blur_value});
                        filter: blur(${blur_value});
            }
        }
    @keyframes hoge {
        from {
            -webkit-filter: blur(0px);
                    filter: blur(0px);
        } to {
            -webkit-filter: blur(${blur_value});
                    filter: blur(${blur_value});
        }
    }
`;

/*
    APIの入れ物
*/
const EasyModalWindow = {
    get isOpen(){
        return isOpen;
    },
    open,
    close,
    toggle
}

/*
    本体要素・flexboxコンテナを返す
        初回呼び出しで作成、以降はキャッシュを返す
*/
const getContainer = do{
    let container;
    (function(){
        if( !container ){
            container = makeElement('div', {
                class: 'easy-modal-window',
                style:
                    `margin: 0;
                    padding: 0;
                    -webkit-box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                    display: -webkit-box;
                    display: -webkit-flex;
                    display: -moz-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-pack: center;
                    -webkit-justify-content: center;
                    -moz-box-pack: center;
                    -ms-flex-pack: center;
                    justify-content: center;
                    -webkit-box-align: center;
                    -webkit-align-items: center;
                    -moz-box-align: center;
                    -ms-flex-align: center;
                    align-items: center;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;`
            });
            // 背景クリックで閉じる
            container.addEventListener('click', (e)=>{
                e.target===container && close();
            }, false);
        }
        return container;
    });
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

        const container = getContainer();
        body.appendChild(container);
        container.appendChild(item);

        // 試験的、body要素をheight100%に縮小して非表示部分を隠す
        StyleHandle.addText(css_body);

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

        // モーダル以外をボカす
        StyleHandle.addText(css_animation);

        // アニメーション終了時にresolve、無名関数を挟んでeventを渡さない
        container_apObj.onfinish = (e)=>{
            resolve();
            onOpen({
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
    const container = getContainer();
    const item_old = container.firstChild;
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
        container.appendChild(item_new);
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
        onReplace({
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
        onClose({
            target: null,
            timeStamp: Date.now(),
            type: 'close'
        });
        return Promise.resolve();
    }

    const container = getContainer();
    const item = container.firstChild;
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

    // 試験的、body要素への変更を解除
    StyleHandle.removeText(css_body);

    // ボカし解除
    StyleHandle.removeText(css_animation);
    isOpen = false;

    // 両フェードが終われば両要素をパージしてresolve
    return Promise.all([
        container_promise,
        item_promise
    ]).then( (evtArr)=>{
        container.remove();
        item.remove();
        onClose({
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

/*
    簡易イベント実装
    モジュールオブジェクトにlistenerがあれば実行する
*/
function onOpen(e){
    is.func(EasyModalWindow.onopen) && EasyModalWindow.onopen(e);
}
function onReplace(e){
    is.func(EasyModalWindow.onreplace) && EasyModalWindow.onreplace(e);
}
function onClose(e){
    is.func(EasyModalWindow.onclose) && EasyModalWindow.onclose(e);
}

export default EasyModalWindow;
