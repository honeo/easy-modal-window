// Modules
import makeElement from 'make-element';
import {is, not} from '@honeo/type-check';
import StyleHandle from 'style-handle';

// Var
const doc = document,
    head = doc.head,
    body = doc.body;
let isOpen = false; // 展開の状態


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
    本体要素・コンテナを返す
        初回呼び出しで作成
        legacyではラップ要素も返す、ついでに子要素用のCSSを適用
*/
const getContainer = do{
    let container,
        wrapper;
    (function(){
        if( !container ){
            container = makeElement('div', {
                class: 'easy-modal-window-legacy',
                style:
                    `margin: 0;
                    padding: 0;
                    -webkit-box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0, 0.7);
                    `
            });
            // 背景クリックで閉じる
            container.addEventListener('click', (e)=>{
                e.target===container && close();
            }, false);

            // 子要素用のセンタリング
            wrapper = makeElement('div', {
                style: `
                    margin: 0;
                    padding: 0;
                    -webkit-box-sizing: border-box;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    -webkit-transform: translateY(-50%) translateX(-50%);
                    -moz-transform: translateY(-50%) translateX(-50%);
                    -ms-transform: translateY(-50%) translateX(-50%);
                    -o-transform: translateY(-50%) translateX(-50%);
                    transform: translateY(-50%) translateX(-50%);
                    max-width: 100%;
                    max-height: 100%;
                    overflow: auto;
            `});
            container.appendChild(wrapper);
        }
        return [container, wrapper];
    });
}




/*
    引数要素でモーダルウィンドウを開く
        既に開いていれば中身の要素を入れ替える
        promiseを返す
*/
function open(item){
    if( not.element(item) ){
        throw new TypeError(`invalid argument`);
    }
    if( isOpen ){
        return replace(item);
    }

    const [container, wrapper] = getContainer();
    body.appendChild(container);
    wrapper.appendChild(item);
    isOpen = true;
    onOpen({
        target: item,
        timeStamp: Date.now(),
        type: 'open'
    });
    return Promise.resolve();
}

/*
    中身をさくっと入れ替える
*/
function replace(item){
    const [container, wrapper] = getContainer();
    wrapper.firstChild.remove();
    wrapper.appendChild(item);
    onReplace({
        target: item,
        timeStamp: Date.now(),
        type: 'replace'
    });
    return Promise.resolve();
}

/*
    展開中なら閉じる
        promiseを返す
*/
function close(){
    if( isOpen ){
        const [container, wrapper] = getContainer();
        const item = wrapper.firstChild;
        container.remove();
        item.remove();
        isOpen = false;
        onClose({
            target: null,
            timeStamp: Date.now(),
            type: 'close'
        });
    }
    return Promise.resolve();
}

/*
    トグル
        自身を返す
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
