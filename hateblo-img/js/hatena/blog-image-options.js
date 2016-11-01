(() => {
    "use strict";
    let gaTracker = new GATracker.Create("UA-33470797-7");
    gaTracker.sendScreenView("Configure");
    document.addEventListener("DOMContentLoaded", () => {
        let footerYear = document.getElementById("optionFooterYear");
        let d = new Date();
        footerYear.textContent = d.getFullYear().toString();
    });
    let StorData = {};
    let Toast = (() => {
        let popupFlg = false;
        return {
            up: () => {
                if (popupFlg) {
                    return;
                }
                popupFlg = true;
                Materialize.toast("設定はページ更新後に反映されます", 2000, "", () => {
                    popupFlg = false;
                });
            }
        };
    })();
    chrome.runtime.sendMessage({ "method": "GATracker-getStorage" }, function (response) {
        StorData.GATracker = response.data;
        ga_Setup();
    });
    chrome.runtime.sendMessage({ "method": "blogImageTitle-getSetting" }, function (response) {
        StorData.blogImageTitle = response.data;
        bloglist_test();
        blogImage_Setup();
        $("select").material_select();
    });
    function blogImage_Setup() {
        "use strict";
        let isUpdateBtn = document.getElementById("isUpdateBtn");
        if (StorData.blogImageTitle.isUpdateBtn) {
            isUpdateBtn.checked = true;
        }
        $(isUpdateBtn).on("change", function () {
            let sendData = { "method": "blogImageTitle-putSetting", "key": "isUpdateBtn", "value": isUpdateBtn.checked };
            chrome.runtime.sendMessage(sendData);
            gaTracker.sendEvent("Config", "Change", "useChangeBtn", isUpdateBtn.checked ? 1 : 0);
            Toast.up();
        });
        let updateAltTitle = "3";
        if (StorData.blogImageTitle.updateAlt && StorData.blogImageTitle.updateTitle) {
            updateAltTitle = "1";
        }
        else if (StorData.blogImageTitle.updateAlt) {
            updateAltTitle = "2";
        }
        let updateAltTitleElm = document.getElementById("updateAltTitle");
        if (updateAltTitle) {
            updateAltTitleElm.value = updateAltTitle;
        }
        $(updateAltTitleElm).on("change", function () {
            let alt = true, title = true;
            if (updateAltTitleElm.value === "2") {
                title = false;
            }
            else if (updateAltTitleElm.value === "3") {
                alt = false;
            }
            let sendData = { "method": "blogImageTitle-putSetting", "key": "updateAlt", "value": alt };
            chrome.runtime.sendMessage(sendData);
            sendData = { "method": "blogImageTitle-putSetting", "key": "updateTitle", "value": title };
            chrome.runtime.sendMessage(sendData);
            gaTracker.sendEvent("Config", "Change", "ChangeAlt", alt ? 1 : 0);
            gaTracker.sendEvent("Config", "Change", "ChangeTitle", title ? 1 : 0);
            Toast.up();
        });
        let disableCbox = document.getElementById("disableCbox");
        if (StorData.blogImageTitle.disableCbox) {
            disableCbox.checked = true;
        }
        $(disableCbox).on("change", function () {
            let sendData = { "method": "blogImageTitle-putSetting", "key": "disableCbox", "value": disableCbox.checked };
            chrome.runtime.sendMessage(sendData);
            gaTracker.sendEvent("Config", "Change", "useCbox", disableCbox.checked ? 1 : 0);
            Toast.up();
        });
        let creditText = document.getElementById("creditText");
        if (StorData.blogImageTitle.creditText) {
            creditText.value = StorData.blogImageTitle.creditText;
        }
        $(creditText).on("change", function () {
            let sendData = {
                "method": "blogImageTitle-putSetting",
                "key": "creditText", "value": creditText.value
            };
            chrome.runtime.sendMessage(sendData);
            Toast.up();
        });
        $("input[name=mdModeSyntax]").val([StorData.blogImageTitle.mdModeSyntax]);
        $("input[name=mdModeSyntax]").on("change", function () {
            let sendData = {
                "method": "blogImageTitle-putSetting",
                "key": "mdModeSyntax", "value": $("input[name=mdModeSyntax]:checked").val()
            };
            chrome.runtime.sendMessage(sendData);
            Toast.up();
        });
    }
    function ga_Setup() {
        "use strict";
        let Toast_GA = (() => {
            let popupFlg = false;
            return {
                up: () => {
                    if (popupFlg) {
                        return;
                    }
                    popupFlg = true;
                    Materialize.toast("設定はページ更新後に反映されます", 2000, "", () => {
                        popupFlg = false;
                    });
                }
            };
        })();
        let optoutGA = document.getElementById("optoutGA");
        if (StorData.GATracker.settings.optoutGA) {
            optoutGA.checked = true;
        }
        $(optoutGA).on("change", function () {
            let sendData = { "method": "GATracker-putSettings", "key": "optoutGA", "value": optoutGA.checked };
            chrome.runtime.sendMessage(sendData);
            Toast_GA.up();
        });
    }
    function bloglist_test() {
        if (1) {
            return;
        }
        var f = new XMLHttpRequest;
        f.onload = function () {
            if (f.status !== 200) {
                return;
            }
            let text = f.responseText;
            text = text.replace(/\r?\n/g, "");
            text = text.replace(/<\/li>/g, "</li>\n");
            let list = text.match(/<li class="arrow dropdown-mymenu-submenu">.*<\/li>/gm);
            let ulelm = document.createElement("ul");
            for (let i = 0; i < list.length; i++) {
                ulelm.innerHTML += list[i];
            }
            let blogs = [{ default: { blogid: "", blogIcon: "", title: "初期設定", creditText: "" } }];
            let elemList = {};
            elemList = ulelm.querySelectorAll("[data-blog-id]");
            for (let i = 0; i < elemList.length; i++) {
                blogs.push({
                    blogUrl: elemList[i].href,
                    blogID: elemList[i].getAttribute("data-blog-id"),
                    title: elemList[i].innerText,
                    blogIcon: elemList[i].querySelector("img").src
                });
            }
        };
        f.onerror = function (e) {
            console.error(f.statusText);
        };
        f.open("GET", "http://blog.hatena.ne.jp/-/menu/mymenu?", !0);
        f.send(null);
    }
})();
