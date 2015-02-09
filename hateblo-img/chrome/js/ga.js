/**
 *
 */
var service, tracker;

function setupTrack(viewname){

//	service = analytics.getService('HatebloImageTitle');
	service = analytics.getService(chrome.runtime.getManifest().name);
	//トラッキング許可の設定
	analyticsTrackingPermitted();

	tracker = service.getTracker('UA-33470797-7');

	//トラッキングパフォーマンスの計測
	var timing = tracker.startTiming('Analytics Performance', 'Send Event');

	tracker.sendAppView(viewname);
//	tracker.sendEvent('Interesting Stuff', 'User Did Something');
	timing.send();
}

function analyticsTrackingPermitted(){
	service.getConfig().addCallback(function(config){
		chrome.runtime.sendMessage({method: "getStorage", key: "not_track_ga"}, function(response) {
			if(response.data){
				config.setTrackingPermitted(false);
			}else{
				config.setTrackingPermitted(true);
			}
		});
	});
}

function trackCustomDimension(category,action,label,dim,value){
	var FLAVOR_PICKED = analytics.EventBuilder.builder()
	.category(category)
	.action(action)
	.dimension(value, dim);
	tracker.send(FLAVOR_PICKED.label(label));
}
