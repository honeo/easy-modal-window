// Modules
import makeElement from 'make-element';
import is from '@honeo/type-check';
import StyleHandle from 'style-handle';

// Var
const name = 'modal-window';
const doc = document,
    head = doc.head,
    body = doc.body;
let isOpen = false; // 展開の状態
const ms_duration = 200; //アニメーション総時間
const blur_value = '1px'; //blur()の値

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
        -webkit-animation-duration: ${ms_duration}ms;
        -moz-animation-duration: ${ms_duration}ms;
        -o-animation-duration: ${ms_duration}ms;
        animation-duration: ${ms_duration}ms;
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
const EasyModalWindow = {}

/*
    本体要素・flexboxコンテナを返す
        初回呼び出しで作成
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
                e.target===container && EasyModalWindow.close();
            }, false);
        }
        return container;
    });
}




/*
    引数要素でモーダルウィンドウを開く
        既に開いていれば中身の要素を入れ替える
        自身を返す
        コンテナとアイテムのフェードをeasingでズラすと目に悪い
*/
EasyModalWindow.open = function(item){
    if( !is.element(item) ){
        throw new TypeError(`invalid argument`);
    }

    const container = getContainer();
    if( isOpen ){
        container.firstChild.remove();
        container.appendChild(item);
    }else{
        body.appendChild(container);
        container.appendChild(item);
        // モーダルウィンドウをフェードイン
        const container_apObj = container.animate([{
            background: 'rgba(0,0,0, 0)',
        }, {
            background: 'rgba(0,0,0, 0.7)',
        }], {
            duration: ms_duration,
            fill: 'forwards'
        });

        // 中身をフェードイン
        const item_apObj = item.animate([{
            opacity: 0,
        }, {
            opacity: 1,
        }], {
            duration: ms_duration,
            fill: 'forwards'
        });

        // モーダル以外をボカす
        StyleHandle.addText(css_animation);

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
        const container = getContainer();
        const item = container.firstChild;
        // コンテナをフェードアウト
        const container_apObj = container.animate([{
            background: 'rgba(0,0,0, 0.7)',
        }, {
            background: 'rgba(0,0,0, 0)',
        }], {
            duration: ms_duration,
            fill: 'forwards'
        });
        container_apObj.onfinish = (e)=>{
            container.remove();
            item.remove();
            isOpen = false;
        }
        // アイテムをフェードアウト
        const item_apObj = item.animate([{
            opacity: 1
        }, {
            opacity: 0
        }], {
            duration: ms_duration,
            fill: 'forwards'
        });
        // ボカし解除
        StyleHandle.removeText(css_animation);
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
