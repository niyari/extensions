chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method === "showIcon") {
        chrome.pageAction.show(sender.tab.id);
        sendResponse({
            tabid: sender.tab.id,
            msg: "showIcon OK"
        });
    }
});
if (chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason === "update") {
            onInstalled_updateStorage(details.previousVersion);
        }
        if (details.reason === "install") {
            Htn.API.Notify.basic("はてブロImageTitle", "Chrome メニューから設定ができます。", "images/hateblo_img48.png", "/html/hatena/blog-image-options.html", 2);
        }
    });
}
var bgfunc = Htn.blogImageTitle;
bgfunc.background.addListener();
if (location.protocol === "moz-extension:") {
    fx_onInstalledCheck();
}
function fx_onInstalledCheck() {
    "use strict";
    let manifest = chrome.runtime.getManifest();
    let storageData = {};
    storageData = JSON.parse(localStorage.getItem("blogImageTitle"));
    if (storageData.version !== manifest.version) {
        console.log(storageData.version, manifest.version);
        onInstalled_updateStorage(storageData.version);
    }
}
function onInstalled_updateStorage(previousVersion) {
    "use strict";
    switch (previousVersion) {
        case "0.0.1.10":
        case "0.0.1.13":
        case "0.0.1.14":
            (() => {
                let manifest = chrome.runtime.getManifest();
                let blogImageTitle = {
                    settings: {
                        creditText: "",
                        disableCbox: false,
                        isUpdateBtn: true,
                        mdModeSyntax: "hatena",
                        updateAlt: true,
                        updateTitle: true
                    },
                    version: manifest.version
                };
                let GATracker = JSON.parse(localStorage.getItem("GATracker"));
                localStorage.clear();
                localStorage.setItem("GATracker", JSON.stringify(GATracker));
                localStorage.setItem("blogImageTitle", JSON.stringify(blogImageTitle));
            })();
            Htn.API.Notify.basic("はてブロImageTitle", "新しいバージョンに更新されました。再度設定を行ってください。", "images/hateblo_img48.png", "/html/hatena/blog-image-options.html");
            break;
        case "0.0.1.12":
            (() => {
                let blogImageTitle = { "settings": {} };
                let GATracker = JSON.parse(localStorage.getItem("GATracker"));
                blogImageTitle.settings = JSON.parse(localStorage.getItem("blogImageTitle"));
                localStorage.clear();
                localStorage.setItem("GATracker", JSON.stringify(GATracker));
                localStorage.setItem("blogImageTitle", JSON.stringify(blogImageTitle));
            })();
        default:
            (() => {
                let storageData = {};
                storageData = JSON.parse(localStorage.getItem("blogImageTitle"));
                let manifest = chrome.runtime.getManifest();
                if (storageData.version !== manifest.version) {
                    storageData.version = manifest.version;
                    localStorage.setItem("blogImageTitle", JSON.stringify(storageData));
                    Htn.API.Notify.basic("はてブロImageTitle", "バージョン " + manifest.version_name + " 。\nページの再読み込み後に更新されます。", "images/hateblo_img48.png", "/html/hatena/blog-image-options.html");
                }
            })();
            break;
    }
}
