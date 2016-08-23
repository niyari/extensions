/*
サンプルとしてjQuery読ませていますが、複数のスクリプトを読ませる　という意味でやっているので、利用していません。
*/

(function () {
	function createToolBox() {
		var div_outerElement = document.createElement("div");
		div_outerElement.innerHTML = 'こんにちは！こんにちは！';
		document.getElementById("uploader-wrapper").appendChild(div_outerElement);
		alert('fotolifeの容量部分に追加した');
	}
	document.addEventListener("DOMContentLoaded", function (event) {
		if (document.querySelector('#editor-fotolife')) createToolBox();
	});
})();

