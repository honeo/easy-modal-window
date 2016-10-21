// Modules
import 'babel-polyfill';
import '../../../my-polyfill';
import makeElement from 'make-element';
import AwaitEvent from '@honeo/await-event';
import {is, not} from '@honeo/type-check';
import ModalWindow from '../';
//import ModalWindow from '../legacy';

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
		style: style + 'border: dashed 2px white;' + 'overflow: auto;'
	});
	button.addEventListener('click', (e)=>{
		ModalWindow.open(element);
	});
	div_menu.appendChild(button);
});


// 入れ替えテスト
const button_replace = makeElement('input', {
	value: 'replace',
	type: 'button'
});
const block_style = attributeObjectArr[0].style + 'border: dashed 2px white;' + 'overflow: auto;';
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

// 閉じる操作テスト
const button_closeModeChange = makeElement('input', {
	type: 'button',
	value: `背景クリックで閉じる: ${ModalWindow.isCloseOnBackgroundClick}`
});
button_closeModeChange.addEventListener('click', function(e){
	ModalWindow.isCloseOnBackgroundClick = !ModalWindow.isCloseOnBackgroundClick;
	this.value = `背景クリックで閉じる: ${ModalWindow.isCloseOnBackgroundClick}`;
}, false);
div_menu.appendChild(button_closeModeChange);

// Events
ModalWindow.onopen = (e)=>{
	console.log('onopen', e);
}
ModalWindow.onreplace = (e)=>{
	console.log('onreplace', e);
}
ModalWindow.onclose = (e)=>{
	console.log('onclose', e);
}
