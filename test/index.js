import 'babel-polyfill';
import makeElement from 'make-element';
import ModalWindow from '../';
//import ModalWindow from '../legacy';

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
	document.body.appendChild(button);
});


// 入れ替え
const button = makeElement('input', {
	value: 'replace',
	type: 'button'
});
const button_replace = makeElement('input', {
	value: 'next',
	type: 'button'
});
const button_close = makeElement('input', {
	value: 'close',
	type: 'button'
});
button.addEventListener('click', (e)=>{
	ModalWindow.open(button_replace);
}, false);
button_replace.addEventListener('click', (e)=>{
	ModalWindow.open(button_close);
}, false);
button_close.addEventListener('click', (e)=>{
	ModalWindow.close();
}, false);
document.body.appendChild(button);
