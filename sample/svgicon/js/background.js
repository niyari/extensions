/*
SVG icon test
http://psn.hatenablog.jp/entry/discover-hatena
*/
function makeSvgElem(w, h) {
	// SVGエレメントを作成します。
	var svgElm = document.createElement("svg");
	svgElm.setAttribute("version", "1.1");
	svgElm.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	svgElm.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	svgElm.setAttribute("x", "0px");
	svgElm.setAttribute("y", "0px");
	svgElm.setAttribute("width", w + "px");
	svgElm.setAttribute("height", h + "px");
	svgElm.setAttribute("viewBox", "0 0 " + w + " " + h);
	svgElm.setAttribute("enable-background", "new 0 0 " + w + " " + h);
	svgElm.setAttribute("xml:space", "preserve");
	return svgElm;

}
function makeBGElem() {
	// https://github.com/niyari のプロフィールアイコンを描画します。
	var svgElm = document.createElement("g");
	svgElm.innerHTML = '<path fill="#8D62DA" d="M20,20v30h30v30H20v90h150V80h-30V50h30V20h-60v30H80V20H20z M50,140V80h90v60h-30v-30H80v30H50z"/>';
	return svgElm;
}
function makeTextElem(str) {
	// strの文字列を赤色・右寄せで表示します。
	var svgElm = document.createElement("g");
	svgElm.innerHTML = '<text transform="matrix(1 0 0 1 180 120)" fill="#FF0000" font-size="150" letter-spacing="-12" text-anchor="end">' + str + '</text>';
	return svgElm;
}

function makeClockElem(elmType, r) {
	// example3から呼ばれます。
	// 時計の針を描画します。
	var y1 = 90;
	var y2 = 35;
	var stroke = 20;
	var color = "#000000";
	switch (elmType) {
		case 'm':
			y1 = 90;
			y2 = 10;
			stroke = 10;
			color = "#444444";
			break;
		case 's':
			y1 = 45;
			y2 = 5;
			stroke = 10;
			color = "#666666";
			break;
		default:
			break;
	}
	var svgElm = document.createElement("g");
	svgElm.innerHTML = '<line x1="90" y1="' + y1 + '" x2="90" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + stroke
		+ '" transform="rotate(' + r + ' 90 90)"/>';
	return svgElm;
}

chrome.alarms.onAlarm.addListener(function (alarm) {
	switch (alarm.name) {
		case 'example2':
			example2();
			break;
		case 'example3':
			example3();
			break;
		default:
			break;
	}
});

function example1() {
	var svg = makeSvgElem(190, 190); //190x190のSVGエレメントを作成する
	svg.appendChild(makeBGElem()); //エレメントに画像を入れる
	svg.appendChild(makeTextElem("01")); //テキストを入れる
	/*
	// canvasを利用してアレコレする場合
	// setIconを使うのみの場合は利用しません
	var canvas = document.createElement("canvas");
	canvas.width = svg.width;
	canvas.height = svg.height;
	*/

	// data URI Schemeへ変換する
	var data = new XMLSerializer().serializeToString(svg)
	var imgsrcBase64 = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(data))); //base64の場合
	var imgsrc = "data:image/svg+xml;charset=utf-8;," + encodeURIComponent(data); //URIエンコードの場合

	//アイコンをセットする
	chrome.browserAction.setIcon({ 'path': imgsrc });
	/*
	// canvasを利用してアレコレする場合
	var ctx = canvas.getContext("2d")
	var image = new Image()
	image.onload = function () {
		ctx.drawImage(image, 0, 0);
	}
	image.src = imgsrcBase64;
	*/

}

function example2() {
	var d = new Date();
	var nowS = d.getSeconds();
	var svg = makeSvgElem(190, 190);
	svg.appendChild(makeTextElem(nowS));

	var data = new XMLSerializer().serializeToString(svg)
	var imgsrcBase64 = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(data)));
	var imgsrc = "data:image/svg+xml;charset=utf-8;," + encodeURIComponent(data);
	chrome.browserAction.setIcon({ 'path': imgsrc });
	chrome.alarms.create('example2', { when: Date.now() + 900 });

}

function example3() {
	var d = new Date();
	var nowH = d.getHours();
	var nowM = d.getMinutes();
	var nowS = d.getSeconds();
	var nowMs = d.getMilliseconds();
	var svg = makeSvgElem(190, 190);

	if (nowH > 11) { nowH = nowH - 12; }
	nowH = (nowH * 5 + (nowM / 12) + (nowS / 720)) * 6;
	svg.appendChild(makeClockElem('h', nowH));

	nowM = (nowM + nowS / 60) * 6;
	svg.appendChild(makeClockElem('m', nowM));

	nowS = (nowS + nowMs / 1000) * 6;
	svg.appendChild(makeClockElem('s', nowS));

	var data = new XMLSerializer().serializeToString(svg)
	var imgsrcBase64 = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(data)));
	var imgsrc = "data:image/svg+xml;charset=utf-8;," + encodeURIComponent(data);
	chrome.browserAction.setIcon({ 'path': imgsrcBase64 });
	chrome.alarms.create('example3', { when: Date.now() + 333 });

}

window.onload = function () {
	//example1();
	// SVG画像・文字を表示
	//example2();
	// 現在時刻の「秒」を表示
	example3();
	// 小さなアナログ時計を表示
}
