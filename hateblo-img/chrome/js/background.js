/**
 *
 */
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){
	//request 受信データ
	//sender 送信元タブ属性
	if(request.method === "showIcon"){
		chrome.pageAction.show(sender.tab.id);
		sendResponse({
			tabid:sender.tab.id,
			msg:"showIcon OK"
		});
	}else if(request.method === "getStorage"){
		sendResponse({
			data:get_storage(request.key)
		});
	}else if(request.method === "putStorage"){
		put_storage(request.key,request.data);
		sendResponse({
			msg:request.key + " as " + request.data
		});
	}else{
		sendResponse({});
	}
});
chrome.pageAction.onClicked.addListener(function (tabid){
	console.log("iconクリックした");
});
