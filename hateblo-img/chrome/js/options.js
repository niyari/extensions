/**
 *
 */
/* 設定ロード */
function setupOptions(){
	var mn1_btn_change = document.getElementById('set1_btnclick');
	setupTrack('Configure');
	addClickListener(mn1_btn_change,'btn_change');

	var mn1_alttitle1 = document.getElementById('set1_alttitle1');
	var mn1_alttitle2 = document.getElementById('set1_alttitle2');
	var mn1_alttitle3 = document.getElementById('set1_alttitle3');
	[mn1_alttitle1,mn1_alttitle2,mn1_alttitle3].forEach( function(elem) {
		addClickListener(elem,'alttitle');
	});

	var mn1_disable_cbox = document.getElementById('set1_cbox');
	addClickListener(mn1_disable_cbox,'disable_cbox');

	var mn2_not_track_ga = document.getElementById('set2_analytics');
	addClickListener(mn2_not_track_ga,'not_track_ga');

	clickMenuTab();


	chrome.runtime.sendMessage({method: "getStorage", key: "btn_change"}, function(response) {
		if(response.data){
			mn1_btn_change.checked = true;
		}
	});

	chrome.runtime.sendMessage({method: "getStorage", key: "alt_change"}, function(response) {
		var alt_change = response.data;
		chrome.runtime.sendMessage({method: "getStorage", key: "title_change"}, function(response) {
			var title_change = response.data;
			if (!alt_change && title_change){
				//titleのみ変える
				mn1_alttitle3.checked = true;
			}else if(alt_change && !title_change){
				//altのみ変える
				mn1_alttitle2.checked = true;
			}else{
				//両方変える
				mn1_alttitle1.checked = true;
			}
		});
	});

	chrome.runtime.sendMessage({method: "getStorage", key: "disable_cbox"}, function(response) {
		if(response.data){
			mn1_disable_cbox.checked = true;
		}
	});

	chrome.runtime.sendMessage({method: "getStorage", key: "not_track_ga"}, function(response) {
		if(response.data){
			mn2_not_track_ga.checked = true;
		}
	});

}


function clickMenuTab(){
	/* メニューの切り替え */
	var menu1 = document.getElementById('setmenu1');
	var menu2 = document.getElementById('setmenu2');
	var menu3 = document.getElementById('setmenu3');
	[menu1,menu2,menu3].forEach( function(elem,index) {
		elem.addEventListener('click', function() {
			$("#setting1").addClass("hidemenu");
			$("#setting2").addClass("hidemenu");
			$("#setting3").addClass("hidemenu");
			$(document.getElementById(this.getAttribute('data-target') ) ).removeClass("hidemenu");
			tracker.sendEvent('ConfigPage', 'Change', 'page',index);
		});
	});

}

function addClickListener(elem,key) {
	elem.addEventListener('click', function() {
		var trackValue = 0;
		switch (key){
		/* 設定1 */
		case 'btn_change':
			//変更するボタンチェック
			var select_flg = false;
			if(elem.checked){
				select_flg = true;
				trackValue = 1;
			}
			putStorage("btn_change",select_flg);
			tracker.sendEvent('Config', 'Change', 'useChangeBtn',trackValue);
			break;
		case 'alttitle':
			//属性変更
			changeAltTitle(elem.value);
			break;
		case 'disable_cbox':
			//画像拡大チェック
			var disable_flg = false;
			trackValue = 1;
			if(elem.checked){
				disable_flg = true;
				trackValue = 0;
			}
			putStorage("disable_cbox",disable_flg);
			tracker.sendEvent('Config', 'Change', 'useCbox',trackValue);
			break;
		/* 設定2 */
		case 'not_track_ga':
			//gaトラッキング拒否
			var select_flg = false;
			if(elem.checked){
				select_flg = true;
			}
			putStorage("not_track_ga",select_flg);
			break;
		default:
			//
		}
	});
}

function changeAltTitle(value){
	var alt_flg = true;
	var title_flg = true;
	var alt_value = 1;
	var title_value = 1;
	if(value === "2"){
		title_flg = false;
		title_value = 0;
	}else if(value === "3"){
		alt_flg = false;
		alt_value = 0;
	}
	putStorage("alt_change",alt_flg);
	putStorage("title_change",title_flg);
	tracker.sendEvent('Config', 'Change', 'ChangeAlt',alt_value);
	tracker.sendEvent('Config', 'Change', 'ChangeTitle',title_value);
}

function putStorage(key,data){
	chrome.runtime.sendMessage({method: "putStorage", key: key, data: data}, function(response) {
		analyticsTrackingPermitted();
	});
}

setupOptions();
