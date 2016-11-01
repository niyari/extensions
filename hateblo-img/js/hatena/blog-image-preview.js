(() => {
    "use strict";
    function getParam() {
        var hash = location.hash.substring(1).split("&");
        var val = {};
        for (var i = 0; i < hash.length; i++) {
            var param = hash[i].split("=");
            val[param[0]] = param[1];
        }
        return val;
    }
    var preview = document.getElementById("preview");
    var hash = getParam();
    var myTab;
    chrome.tabs.query({ currentWindow: true, active: true }, (tabInfo) => {
        myTab = tabInfo[0];
    });
    var port = chrome.tabs.connect(Number(hash.tabid), { name: "HatenaBlogImage-OpenPreview" });
    port.postMessage({ status: "Connect" });
    window.onbeforeunload = function () {
        port.postMessage({ status: "Close", tabid: myTab });
    };
    port.onMessage.addListener(function (msg) {
        if (msg.request === "OpenUri") {
            preview.src = msg.uri;
            if (location.protocol === "chrome-extension:") {
                chrome.tabs.update(myTab.id, { highlighted: true });
                chrome.windows.update(myTab.windowId, { focused: true });
            }
            else {
                chrome.tabs.update(myTab.id, {});
                chrome.windows.update(myTab.windowId, {});
            }
        }
    });
    port.onDisconnect.addListener(function () {
        chrome.tabs.remove(myTab.id);
    });
})();
