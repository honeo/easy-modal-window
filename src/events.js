/*
    簡易イベント実装
        モジュールオブジェクトにlistenerがあれば実行する
        this = モジュールオブジェクト
*/

// Modules
import {is, not, any} from '@honeo/check';

function onOpen(e){
    is.func(this.onopen) && this.onopen(e);
}

function onReplace(e){
    is.func(this.onreplace) && this.onreplace(e);
}

function onClose(e){
    is.func(this.onclose) && this.onclose(e);
}

export {
	onOpen,
	onReplace,
	onClose
}
