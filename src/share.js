/*
	共通で使い回すオブジェクト
*/
export default {
	backgroundColor: 'rgba(0,0,0, 0.72)', // 背景色
	duration_ms: 160, // アニメーション総時間
	insertedElement: null, // 外部から挿入中の要素
	isBackgroundBlur: true, // 展開中に背景をボカすか
	isCloseOnBackgroundClick: true, // 背景クリックでも閉じるかどうか
	isCloseOnInsertedElement: false, // 挿入した要素のクリックでも閉じるか
	isOpen: false, // 展開の状態
	weakmap: new WeakMap() // 挿入した要素:挿入地点メモのダミー要素
}
