// Modules
import 'babel-polyfill';
import '../../../my-polyfill';
import makeElement from 'make-element';
import AwaitEvent from '@honeo/await-event';
import {is, not} from '@honeo/type-check';
import ModalWindow from '../';

// 設定
ModalWindow.debug = true;

// Var
const div_menu = document.getElementById('menu');

// 各サイズ
const attributeObjectArr = [{
	style: 'width: 300px; height:300px;',
	value: '300x300'
}, {
	style: 'width: 1000px; height:300px;',
	value: '1000x300'
}, {
	style: 'width: 300px; height:1000px;',
	value: '300x1000'
}, {
	style: 'width: 1000px; height:1000px;',
	value: '1000x1000'
}, {
	style: 'width: 2000px; height: 300px;',
	value: '2000x300'
}, {
	style: 'width: 300px; height: 2000px;',
	value: '300x2000'
}];

attributeObjectArr.forEach( ({style, value})=>{
	const button = makeElement('input', {
		value,
		type: 'button'
	});
	const element = makeElement('div', {
		style: style + 'background-color: white; border: dashed 2px gray;' + 'overflow: auto;'
	});
	button.addEventListener('click', (e)=>{
		ModalWindow.open(element);
	});
	div_menu.appendChild(button);
});

// Selectorから挿入テスト
const button_selector = makeElement('input', {
	value: 'selector',
	type: 'button'
});
button_selector.addEventListener('click', function(e){
	// ついでにエラーテスト
	ModalWindow.open('#hage').catch( (error)=>{
		ModalWindow.open('#piyo');
	});
}, false);
div_menu.append(button_selector);

// 入れ替えテスト
const button_replace = makeElement('input', {
	value: 'replace',
	type: 'button'
});
const block_style = attributeObjectArr[0].style + 'border: dashed 2px white;' + 'overflow: auto;' + 'color: white;';
const blockA = makeElement('div', {style: block_style}, 'next');
const blockB = makeElement('div', {style: block_style}, 'close');
button_replace.addEventListener('click', (e)=>{
	ModalWindow.toggle(blockA).then( _=>{
		return AwaitEvent(blockA, 'click', false);
	}).then( _=>{
		return ModalWindow.open(blockB);
	}).then( _=>{
		return AwaitEvent(blockB, 'click', false);
	}).then( _=>{
		return ModalWindow.close();
	}).catch( (error)=>{
		throw error;
	});
}, false);

div_menu.appendChild(button_replace);

// 背景クリックで閉じる操作
const button_closeModeChange = makeElement('input', {
	type: 'button',
	value: `isCloseOnBackgroundClick: ${ModalWindow.isCloseOnBackgroundClick}`
});
button_closeModeChange.addEventListener('click', function(e){
	ModalWindow.isCloseOnBackgroundClick = !ModalWindow.isCloseOnBackgroundClick;
	this.value = `isCloseOnBackgroundClick: ${ModalWindow.isCloseOnBackgroundClick}`;
}, false);
div_menu.appendChild(button_closeModeChange);

// 挿入した要素クリックで閉じる操作
const button_closeModeChange2 = makeElement('input', {
	type: 'button',
	value: `isCloseOnInsertedElement: ${ModalWindow.isCloseOnInsertedElement}`
});
button_closeModeChange2.addEventListener('click', function(e){
	ModalWindow.isCloseOnInsertedElement = !ModalWindow.isCloseOnInsertedElement;
	this.value = `isCloseOnInsertedElement: ${ModalWindow.isCloseOnInsertedElement}`;
}, false);
div_menu.appendChild(button_closeModeChange2);

// BlurON/OFFテスト
const button_blurSwitch = makeElement('input', {
	type: 'button',
	value: `blur: ${ModalWindow.isBackgroundBlur}`
});
button_blurSwitch.addEventListener('click', function(e){
	ModalWindow.isBackgroundBlur = !ModalWindow.isBackgroundBlur;
	this.value = `blur: ${ModalWindow.isBackgroundBlur}`;
}, false);
div_menu.appendChild(button_blurSwitch);

// bodyスクロールバー表示・非表示
const button_hideScrollbar = makeElement('input', {
	type: 'button',
	value: `isHideScrollbar: ${ModalWindow.isHideScrollbar}`
});
button_hideScrollbar.addEventListener('click', function(e){
	ModalWindow.isHideScrollbar = !ModalWindow.isHideScrollbar;
	this.value = `isHideScrollbar: ${ModalWindow.isHideScrollbar}`;
}, false);
div_menu.appendChild(button_hideScrollbar);

// 背景色変更
const input_color = makeElement('input', {
	type: 'color'
});
input_color.addEventListener('input', function(e){
	ModalWindow.backgroundColor = e.target.value;
}, false);
div_menu.appendChild(input_color);

// Events
ModalWindow.onopen = (e)=>{
	console.log('onopen', e);
	console.log('insertedElement', ModalWindow.insertedElement);
}
ModalWindow.onreplace = (e)=>{
	console.log('onreplace', e);
}
ModalWindow.onclose = (e)=>{
	console.log('onclose', e);
}
