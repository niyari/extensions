/*
 * はてブロimageTitle (仮)
 * この辺の設定は、はてなさんがガッチリやってくれるとみんなしあわせになる
 *
 *
 * OKTODO 設定画面はあった方が良い
 * OKTODO テキストのフォーカスが外れたら変更するオプションとか
 * OKTODO チェックボックス触った時に変更するオプションとか
 * TODO 既に貼ってある画像を編集するとか
 *
 */

$(function(){
	var alt_change = true, title_change = true, not_track_ga = false, btn_change = true;
	var editTitle,editCbox,editTarget,editChangeBtn;
	var syntaxMode = 'hatena';
	setupTrack('Editview');

	function createToolBox(){
		//外枠をつくる
		var edit_element ='';
		var div_outerElement = document.createElement("div");
		div_outerElement.id = 'psne-fotolofe-helper';
		div_outerElement.innerHTML = '<i class="blogicon-plugin"></i><i class="blogicon-edit"></i> 画像のタイトル変えるやつ <a href="http://psn.hatenablog.jp/" target="_blank"><i class="blogicon-help tipsy-left" original-title="この設定は id:psne が作成した拡張機能によるものです。クリックすると作者ページへアクセスできます。はてな記法では変更できません。"></i></a>';
		var div_element = document.createElement("div");
		div_element.id = 'psne-fotolofe-helper-inner';

		syntaxMode = $('#edit-form').find('[name="syntax"]').val();
		tracker.sendEvent('Edit', 'SyntaxMode', syntaxMode);

		if (syntaxMode === 'hatena'){
			div_element.innerHTML = '<div id="psne-fotolofe-helper-syntax-hatena" class="error-box">はてな記法モードでは画像のタイトル変更ができません。</div>';
			div_outerElement.appendChild(div_element);
			document.getElementById("editor-support-operations").appendChild(div_outerElement);
			return;
		}

		//右側の入力関連を作る
		edit_element += '<input type="text" id="psne-fotolofe-helper-edit-title" value="(タイトル)" disabled><br>';
		edit_element += '<input type="checkbox" id="psne-fotolofe-helper-edit-cb" value="1" disabled><label for="psne-fotolofe-helper-edit-cb">クリックで拡大しない</label><br>';
		edit_element += '<div id="psne-fotolofe-helper-submit" class="psne-fotolofe-helper-btn psne-fotolofe-helper-disabled">変更する</div>';
		edit_element += '<input type="hidden" id="psne-fotolofe-helper-edit-target" value="">';

		//右側をつくる
		edit_element = '<div id="psne-fotolofe-helper-edit">' + edit_element + '</div><div id="psne-fotolofe-helper-edit-end"></div>';
		//画像表示を作る(左側)、組み立て
		div_element.innerHTML = '<div id="psne-fotolofe-helper-image"><div id="psne-fotolofe-helper-changed"><i class="blogicon-check lg"></i></div></div>' + edit_element;

		div_outerElement.appendChild(div_element);
		document.getElementById("editor-support-operations").appendChild(div_outerElement);

		editTitle = document.getElementById('psne-fotolofe-helper-edit-title');
		editCbox = document.getElementById('psne-fotolofe-helper-edit-cb');
		editChangeBtn = document.getElementById('psne-fotolofe-helper-submit');
		editTarget = document.getElementById('psne-fotolofe-helper-edit-target');
		load_settings();
		disabledForm();
		eventListener();
	}

	/* サンプルデータ。
<div class="item" data-syntax="[f:id:psne:20150122151429p:plain]" data-html="<p><span itemscope itemtype=&quot;http://schema.org/Photograph&quot;><img src=&quot;http://cdn-ak.f.st-hatena.com/images/fotolife/p/psne/20150122/20150122151429.png&quot; alt=&quot;f:id:psne:20150122151429p:plain&quot; title=&quot;f:id:psne:20150122151429p:plain&quot; class=&quot;hatena-fotolife&quot; itemprop=&quot;image&quot;></span></p>
" style="background-image: url(&quot;http://f.st-hatena.com/images/fotolife/p/psne/20150122/20150122151429_120.jpg&quot;)"></div>
*/

	function changeImgAttr(){
		var divImg = document.querySelector('#editor-fotolife #items');
		var imgAttr = divImg.querySelectorAll('.item');
		var target = editTarget.value;
		var altTitle = editTitle.value.replace(/"/g, '&quot;' );;
		$(imgAttr).each(function(){
			if( $(this).data('syntax') === target ){
				//HTML置換
				//Mdについては、現状はHTMLベタ書き。data属性を無視する代わりにMd用に記述しても良いかもしれない。
				//TODO なんで見たままモードではschema.org/Photograph使われないんです？
				var html = this.getAttribute('data-html');
				if (alt_change) html = html.replace(/alt="(.*?)"/gm, 'alt="' + altTitle + '"' );
				if (title_change) html = html.replace(/title="(.*?)"/gm, 'title="' + altTitle + '"' );

				//リンクを開かない の判定
				html = change_fotolifeClass(html);

				this.setAttribute('data-html',html);
				this.setAttribute('data-modified-title', editTitle.value );

				//はてな記法置換 (タイトルの付け方が不明)
//				var syntaxTitle = encodeURIComponent(altTitle);
//				var syntax = $(this).data('syntax').match(/(\[f:id:.+:\d+.:)(plain|image|movie)(:.+\]|\])/)[1];
//				syntax = syntax + 'plain:title=' + syntaxTitle + ']';
//				//はてな記法で画像にタイトル付ける書き方を忘れた奴
//				this.setAttribute('data-syntax',syntax);
				$("#psne-fotolofe-helper-changed").fadeIn(100).fadeOut("slow");
			}
		});
	}

	function change_fotolifeClass(html){
		//将来的にはclassのhatena-fotolifeだけ弄った方が良いかもしれない
		// /class=".*hatena-fotolife.*(?="\s)/ か /class=".*hatena-fotolife.*"\s/
		html = html.replace(/hatena-fotolife/m, '' );
		if( editCbox.checked === false){
			//つける
			//class="hatena-fotolife"
			html = html.replace(/class="/m, 'class="hatena-fotolife ' );
		}
		return html;
	}

	function disabledForm(){
		//デフォルトが大はてな実験の画像なので、指定自体を消してCSS当てる
		editTitle.value = null;
		editTitle.disabled = true;
		editCbox.disabled = true;
		editChangeBtn.classList.add("psne-fotolofe-helper-disabled");
		editChangeBtn.classList.remove("psne-fotolofe-helper-enabled");
		$('#psne-fotolofe-helper-image').css('background-image', '' );
	}

	function load_settings(){
		chrome.runtime.sendMessage({method: "getStorage", key: "alt_change"}, function(response) {
			alt_change = response.data;
		});
		chrome.runtime.sendMessage({method: "getStorage", key: "title_change"}, function(response) {
			title_change = response.data;
		});
		chrome.runtime.sendMessage({method: "getStorage", key: "not_track_ga"}, function(response) {
			not_track_ga = response.data;
		});
		chrome.runtime.sendMessage({method: "getStorage", key: "btn_change"}, function(response) {
			btn_change = response.data;
		});
		chrome.runtime.sendMessage({method: "getStorage", key: "disable_cbox"}, function(response) {
			if(syntaxMode != 'hatena' && response.data){
				editCbox.checked = true;
			}
		});

		chrome.runtime.sendMessage({method: "showIcon"}, function(response) {
//			console.log("タブID " + response.tabid);
//			console.log(response.msg);
		});

	}

	function eventListener(){
		$("#editor-fotolife #items").on("click", ".item", function(elem){
			if (syntaxMode === 'hatena') return;
			if( ! this.classList.contains('selected') ){
				//選択済み
				if(this.getAttribute('data-modified-title') != null){
					editTitle.value = this.getAttribute('data-modified-title');
				}else{
					editTitle.value = this.getAttribute('data-html').match(/(?:title=")(.*?)(?:")/)[1];
				}
				editTarget.value = this.getAttribute('data-syntax');
				editTitle.disabled = false;
				editCbox.disabled = false;
				editChangeBtn.classList.remove("psne-fotolofe-helper-disabled");
				editChangeBtn.classList.add("psne-fotolofe-helper-enabled");
				$('#psne-fotolofe-helper-image').css('background-image',$(this).css('background-image') );
				load_settings();
				tracker.sendEvent('Edit', 'Select', 'Pictures');
			}else{
				//選択解除
				tracker.sendEvent('Edit', 'UnSelect', 'Pictures');
				disabledForm();
			}
		});

		editChangeBtn.addEventListener('click', function() {
			changeImgAttr();
			tracker.sendEvent('Edit', 'Change', 'TitleBtn');
		});
		$('.paste-button').click(function(event){
			//本家の画像貼り付けボタンを押した時の挙動。とりあえず解除しておく。
			tracker.sendEvent('Edit', 'Insert', 'Pictures');
			if (syntaxMode === 'hatena') return;
			disabledForm();
		});

		editTitle.addEventListener('change', function() {
			if(!btn_change) changeImgAttr();
			tracker.sendEvent('Edit', 'Change', 'Title');
			console.log("editTitle change");
		});
		editCbox.addEventListener('click', function() {
			if(!btn_change) changeImgAttr();
			tracker.sendEvent('Edit', 'Change', 'Cbox');
			console.log("editCbox click");
		});

	}

	console.log("はてブロimageTitleスタート");

	//ターゲットをはてなブログのドメインblog.hatena.ne.jpにしてあるので、
	//該当するページの場合はとにかくエディタが起動しているかチェックして生成する。
	//が、とりあえずマニフェストファイル側で判定するようにした。

	if(document.querySelector('#editor-support-operations')) createToolBox();



});
