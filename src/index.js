/*

*/

// Mod
import AwaitEvent from '@honeo/await-event';
import {is, not, any} from '@honeo/check';
// Local
import {onOpen, onReplace, onClose} from './lib/events.js';
import bodyCtrl from './lib/body-ctrl/index.js';
import elements from './elements.js'; // 表示用要素
import share from './share.js';
// css modules
import styles from './style.css';


// Var
const doc = document;
const head = doc.head;
const body = doc.body;

/*
    APIの入れ物
        設定値はプロパティ用オブジェクトを作って変数とまとめたいが
*/
const EasyModalWindow = {
    get backgroundColor(){
        return share.backgroundColor;
    },
    set backgroundColor(colortext){
        if( is.str(colortext) ){
            share.backgroundColor = colortext;
        }
    },
    get insertedElement(){
        return share.insertedElement;
    },
    get isOpen(){
        return share.share.isOpen;
    },
    get isBackgroundBlur(){
        return share.isBackgroundBlur;
    },
    set isBackgroundBlur(arg){
        if( is.bool(arg) ){
            share.isBackgroundBlur = arg;
        }
    },
    get isCloseOnBackgroundClick(){
        return share.isCloseOnBackgroundClick;
    },
    set isCloseOnBackgroundClick(arg){
        if( is.bool(arg) ){
            share.isCloseOnBackgroundClick = arg;
        }
    },
    get isCloseOnInsertedElement(){
        return share.isCloseOnInsertedElement;
    },
    set isCloseOnInsertedElement(arg){
        if( is.bool(arg) ){
            share.isCloseOnInsertedElement = arg;
        }
    },
    get isHideScrollbar(){
        return share.isHideScrollbar;
    },
    set isHideScrollbar(arg){
        if( is.bool(arg) ){
            share.isHideScrollbar = arg;
        }
    },
    open,
    close,
    toggle,
    debug: false
}
share.EasyModalWindow = EasyModalWindow;


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
async function open(_item){
    // 要素ならそのまま、文字列ならselectorとしてelementを探す
    const item = is.str(_item) ?
        doc.querySelector(_item):
        _item;

    // Validation
    if( not.element(item) ){
        throw new TypeError(`Invalid argument`);
    }

    // 既に開いていれば入れ替える
    if( share.isOpen ){
        return replace(item);
    }

    body.appendChild(elements.container);
    // 親ノードがあれば位置記憶用のダミーを挿入
    if( item.parentNode ){
        const dummy = elements.dummy;
        item.after(dummy);
        share.weakmap.set(item, dummy)
    }
    elements.centering.appendChild(item);

    // 挿入中要素メモ
    share.insertedElement = item;

    // 設定有効時、body要素をheight100%に縮小して非表示部分を隠す
    share.isHideScrollbar && bodyCtrl.hidden();

    // モーダルウィンドウ（背景）をフェードイン、挿入要素より遅らせる
    const container_apObj = elements.container.animate([{
        background: 'rgba(0,0,0, 0)',
        opacity: 0
    }, {
        background: share.backgroundColor,
        opacity: 1
    }], {
        duration: share.duration_ms*2,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // 設定有効時はモーダル以外をボカす
    share.isBackgroundBlur && bodyCtrl.blur({
        duration: share.duration_ms*2,
        selector: `.${elements.container.className}`}
    );

    // アニメーション終了時にopen発火、resolve
    await new Promise( (resolve, reject)=>{
        container_apObj.onfinish = (e)=>{
            share.isOpen = true;
            resolve();
            EasyModalWindow::onOpen({
                target: item,
                timeStamp: Date.now(),
                type: 'open'
            });
        }
    });
}

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
async function replace(item_new){

    // 古いアイテムをフェードアウト
    const apObj1 = elements.centering.animate([{
        opacity: 1
    }, {
        opacity: 0
    }], {
        duration: share.duration_ms/2,
        fill: 'forwards'
    });
    await AwaitEvent(apObj1, 'finish', false);

    // フェードアウト後にパージ、対になるダミー要素があれば入れ替える
    if( share.weakmap.has(share.insertedElement) ){
        const dummy = share.weakmap.get(share.insertedElement);
        dummy.replaceWith(share.insertedElement);
    }else{
        share.insertedElement.remove();
    }

    // 新アイテムを挿入して変数上書きしてフェードイン
    elements.centering.appendChild(item_new);
    share.insertedElement = item_new;
    const apObj2 = elements.centering.animate([{
        opacity: 0,
    }, {
        opacity: 1,
    }], {
        duration: share.duration_ms/2,
        fill: 'forwards'
    });
    await AwaitEvent(apObj2, 'finish', false);

    EasyModalWindow::onReplace({
        target: item_new,
        timeStamp: Date.now(),
        type: 'replace'
    });
}


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
async function close(){
    if( !share.isOpen ){
        share.EasyModalWindow::onClose({
            target: null,
            timeStamp: Date.now(),
            type: 'close'
        });
        return;
    }

    // コンテナをフェードアウト
    const container_apObj = elements.container.animate([{
        background: share.backgroundColor,
        opacity: 1
    }, {
        background: 'rgba(0,0,0, 0)',
        opacity: 0
    }], {
        duration: share.duration_ms,
        easing: 'ease-in-out',
        fill: 'forwards'
    });

    bodyCtrl.focus(); // ボカし解除、ボカしてなければ無反応
    share.isOpen = false;

    // フェードアウトが終わればパージしてwindowサイズを戻す
    await AwaitEvent(container_apObj, 'finish', false);
    elements.container.remove();

    // 展開中の要素をパージ、対になるダミー要素があれば入れ替える
    if( share.weakmap.has(share.insertedElement) ){
        const dummy = share.weakmap.get(share.insertedElement);
        dummy.replaceWith(share.insertedElement);
    }else{
        share.insertedElement.remove();
    }

    bodyCtrl.view(); // windowサイズ復元
    // closeイベント
    share.EasyModalWindow::onClose({
        target: share.insertedElement,
        timeStamp: Date.now(),
        type: 'close'
    });
    // 挿入中メモ削除
    share.insertedElement = null;
}

/*
    トグル

        引数
            1...: なんでも
                そのままclose, openに渡す
        返り値
            promise
*/
async function toggle(...arg){
    return share.isOpen ?
        close(...arg):
        open(...arg);
}

export default EasyModalWindow;
