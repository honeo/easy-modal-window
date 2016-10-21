/*
	横軸を固定じゃなくするやつ
		position: fixed, absolute両対応
*/

/*
	引数1に固定解除する要素
	引数2に固定解除するスクロール対象(window, element.parentNode等)
*/
function unfixed(element, scrollTarget){
	scrollTarget.addEventListener('scroll', (e)=>{
		element.style.left = -scrollTarget.scrollX + "px";
	}, false);	
}

export default unfixed;
