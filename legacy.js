// Modules
import makeElement from 'make-element';
import is from '@honeo/type-check';
import StyleHandle from 'style-handle';

// Var
const doc = document,
    head = doc.head,
    body = doc.body;
let isOpen = false; // 展開の状態


/*
    APIの入れ物
*/
const EasyModalWindow = {}

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
                e.target===container && EasyModalWindow.close();
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
        自身を返す
*/
EasyModalWindow.open = function(item){
    if( !is.element(item) ){
        throw new TypeError(`invalid argument`);
    }

    const [container, wrapper] = getContainer();
    if( isOpen ){
        wrapper.firstChild.remove();
        wrapper.appendChild(item);
    }else{
        body.appendChild(container);
        wrapper.appendChild(item);
        isOpen = true;
    }

    return this;
}

/*
    展開中なら閉じる
        自身を返す
*/
EasyModalWindow.close = function(){
    if( isOpen ){
        const [container, wrapper] = getContainer();
        const item = wrapper.firstChild;

        container.remove();
        item.remove();
        isOpen = false;
    }
    return this;
}

/*
    トグル
        自身を返す
*/
EasyModalWindow.toggle = function(element){
    return isOpen ?
        this.close():
        this.open(element);
}

export default EasyModalWindow;
