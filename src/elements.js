/*
    各要素への参照を持つオブジェクト
        参照時に要素がなければ作る

    構造
        <container> FlexContainer
		    <space_top> FlexItem
            <centering> FlexItem
				Contents
            <space_bottom> FlexItem
*/

// Mod
import makeElement from 'make-element';
import {is, not, any} from '@honeo/check';
// Local
import share from './share.js';
// css modules
import styles from './style.css';


const elements = {

	// ✕ボタン
	get close(){
		if( !this._close ){
			this._close = makeElement('div', '✕', {
				class: styles.close
			});
		}
		return this._close;
	},

    // 上部スペース、✕ボタンが入る
    get space_top(){
        if( !this._space_top ){
            // 親
            const div = makeElement('div', {
                class: styles.space_top
            });
            // ✕ボタンをIN
            div.append( this.close );
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
    get container(){
        if( !this._container ){
            const div = makeElement('div', {
                class: styles.container
            });
            this._container = div;

            div.append(elements.space_top, elements.centering, elements.space_bottom);

            window.addEventListener('click', (e)=>{
				// 何れかの条件と一致で閉じる
				any.true(
					// 設定有効なら背景クリック時
					share.isCloseOnBackgroundClick && e.target===div,
					// 閉じるボタン
					e.target===this.close,
					// 設定有効なら挿入した要素かその子孫
					share.isCloseOnInsertedElement && (e.target===share.insertedElement||share.insertedElement.contains(e.target))
				) && share.EasyModalWindow.close();
            }, true);
            // CSS適用
        }
        return this._container;
    },

    // flexboxアイテム、中央寄せ用
    get centering(){
        if( !this._centering ){
            const div = makeElement('div', {
                class: styles.centering
            });
            this._centering = div;
        }
        return this._centering;
    },

    // 挿入した要素と入れ替えで置いておくやつ
    get dummy(){
        if( !this._dummy ){
            this._dummy = makeElement('span', {
                class: styles.dummy,
                style: `display: none;`
            });
        }
        return this._dummy;
    }
}

export default elements;
