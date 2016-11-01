/**
 *
 */

function put_storage(key,data){
	if (!key) return;
	var str = JSON.stringify(data);
	localStorage.setItem(key, str);
//	chrome.storage.local.set({key: str}, function() {});
}

function get_storage(key){
//	chrome.storage.local.set(key, function(res) {
//		if ( res.data === 'undefined' ){
//			res.data = init_strage(key);
//		}
//		return JSON.parse( res.data );
//	});
	var data = localStorage.getItem(key);
	if (data === null ){
		data = init_strage(key);
	}
	return JSON.parse( data );
}

function init_strage(key){
	var data = null;
	switch (key){
	case 'btn_change':
		//
		data = true;
		break;
	case 'alt_change':
		//
		data = true;
		break;
	case 'title_change':
		//
		data = false;
		break;
	case 'disable_cbox':
		//
		data = false;
		break;
	case 'not_track_ga':
		//
		data = false;
		break;
	default:
		//
	}
	put_storage(key,data);
	return  data;
}

