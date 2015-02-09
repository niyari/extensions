/**
 *
 */
function setupPopupView(){
	setupTrack('PopupView');
	var pop_hatenaID = document.getElementById('pop_hatenaID');
	var pop_options = document.getElementById('pop_options');
	var pop_write_blog = document.getElementById('pop_write_blog');
	var pop_twitter = document.getElementById('pop_twitter');
	var pop_hatebu = document.getElementById('pop_hatebu');
	var pop_subscribe = document.getElementById('pop_subscribe');
	var pop_googlep1 = document.getElementById('pop_googlep1');
	[pop_hatenaID,pop_options,pop_write_blog,pop_twitter,pop_hatebu,pop_subscribe,pop_googlep1].forEach( function(elem) {
		elem.addEventListener('click', function() {
			tracker.sendEvent('PopupPage', 'Click', this.getAttribute('data-label'));
		});
	});
}

setupPopupView();
