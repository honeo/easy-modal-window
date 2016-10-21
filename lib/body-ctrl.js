/*
    bodyに対してあれこれ
        全て自身を返す
        bodyサイズを変更・解除
            body要素をheight100%に縮小して非表示部分を隠す
        全ての要素をボカす
            引数オブジェクトで除外するselectorとアニメーション秒数を指定する。
*/

// Modules
import StyleHandle from 'style-handle';
import {is, not} from '@honeo/type-check';

// bodyサイズ変更用
const css_hidden = `
    body {
        height: 100vm;
        overflow: hidden;
    }
`;

// bodyサイズをwindow100%に縮小
function hidden(){
    StyleHandle.addRule(css_hidden);
    return this;
}

// bodyサイズの縮小を解除
function view(){
    StyleHandle.removeRule(css_hidden);
    return this;
}

/*
    ボカし用
        少し遅らせて背景(モーダル以外のbody子要素)をボカす
        WebAnimationAPIでは一括指定ができないためCSS3 Animationでやる
*/

// 引数に合わせてボカし用テキストを作って返す
function createBlurAnimationStyleText({blur='1px', duration=160, selector=''}){
    if( not.str(blur, selector) || not.num(duration) ){
        throw new TypeError('Invalid arguments');
    }
    return `
        body > *:not(${selector}) {
            -webkit-animation-name: hoge;
            -moz-animation-name: hoge;
            -o-animation-name: hoge;
            animation-name: hoge;
            -webkit-animation-duration: ${duration}ms;
            -moz-animation-duration: ${duration}ms;
            -o-animation-duration: ${duration}ms;
            animation-duration: ${duration}ms;
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
                -webkit-filter: blur(${blur});
                        filter: blur(${blur});
            }
        }
        @-moz-keyframes hoge {
                from {
                    -webkit-filter: blur(0px);
                            filter: blur(0px);
                } to {
                    -webkit-filter: blur(${blur});
                            filter: blur(${blur});
                }
            }
        @-o-keyframes hoge {
                from {
                    -webkit-filter: blur(0px);
                            filter: blur(0px);
                } to {
                    -webkit-filter: blur(${blur});
                            filter: blur(${blur});
                }
            }
        @keyframes hoge {
            from {
                -webkit-filter: blur(0px);
                        filter: blur(0px);
            } to {
                -webkit-filter: blur(${blur});
                        filter: blur(${blur});
            }
        }
    `;
}

let temp_cssText; // ボカす際に使ったテキストのキャッシュ

/*
    ボカす
        引数オブジェクトで挙動を設定できる
        option {
            blur: ボカす度合い、default "1px"
            duration: アニメーション開始前の待ち時間、default 160
            selector: ボカし対象から除外する要素のセレクタ、default ""
        }
*/
function blur(option){
    temp_cssText = createBlurAnimationStyleText(option);
    StyleHandle.addText(temp_cssText);
    return this;
}

// ボカし解除
function focus(){
    if( temp_cssText ){
        StyleHandle.removeText(temp_cssText);
        temp_cssText = null;
    }
    return this;
}

export default {
    hidden,
    view,
    focus,
    blur
}
