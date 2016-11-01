(() => {
    "use strict";
    let gaTracker = new GATracker.Create("UA-33470797-7");
    let StorData = {};
    let alt_change = true, title_change = true, btn_change = true, md_syntax = "hatena";
    let editTitle, editAlt, editChkBox, editTarget, editChangeBtn;
    let editTargetImgURI, editTargetImgBox, fotolifeImagePreview;
    let targetItem;
    let syntaxMode = "hatena";
    let execFlagElement = "#editor-fotolife";
    let appendToElementId = "uploader-wrapper";
    function change_fotolifeClass(html) {
        html = html.replace(/hatena-fotolife/m, "");
        if (editChkBox.checked === false) {
            html = html.replace(/class="/m, `class="hatena-fotolife `);
        }
        return html;
    }
    function change_syntaxMarkdown(elem) {
        let altTitle = elem.getAttribute("data-modified-title");
        if (!altTitle) {
            altTitle = elem.getAttribute("data-syntax").match(/\[(\S+)\]/i)[1];
            elem.setAttribute("data-modified-title", altTitle);
        }
        let html = elem.getAttribute("data-html");
        if (md_syntax === "markdown") {
            let syntax = "![";
            let imgURL = html.match(/src=\"(\S+)\"\s/i)[1];
            syntax += alt_change ? altTitle + "](" : "](";
            syntax += imgURL;
            syntax += title_change ? ` "` + altTitle + `")` : `)`;
            elem.setAttribute("data-syntax", syntax);
        }
        else if (md_syntax === "html") {
            elem.setAttribute("data-syntax", html);
        }
    }
    function change_syntaxHatena(elem) {
        let altTitle = elem.getAttribute("data-modified-title");
        if (!altTitle) {
            altTitle = elem.getAttribute("data-syntax").match(/\[(\S+)\]/i)[1];
            elem.setAttribute("data-modified-title", altTitle);
        }
        let html = elem.getAttribute("data-html");
        elem.setAttribute("data-syntax", html);
    }
    function changeImgAttr() {
        let altTitle = editTitle.value.replace(/"/g, "&quot;");
        ;
        let html = targetItem.getAttribute("data-html");
        if (alt_change) {
            html = html.replace(/alt="(.*?)"/gm, `alt="` + altTitle + `"`);
        }
        ;
        if (title_change) {
            let creditText = altTitle;
            if (StorData.creditText !== "") {
                creditText += " / " + StorData.creditText;
            }
            html = html.replace(/title="(.*?)"/gm, `title="` + creditText + `"`);
        }
        ;
        html = change_fotolifeClass(html);
        targetItem.setAttribute("data-html", html);
        targetItem.setAttribute("data-modified-title", editTitle.value);
        if (syntaxMode === "markdown") {
            change_syntaxMarkdown(targetItem);
        }
        if (syntaxMode === "hatena") {
            change_syntaxHatena(targetItem);
        }
        var fadeIcon = (() => {
            var popupFlg = false;
            let changed_elem = document.getElementById("psne-fotolofe-helper-changed");
            return {
                up: () => {
                    if (popupFlg) {
                        return;
                    }
                    changed_elem.classList.add("fade");
                    popupFlg = true;
                    window.setTimeout(() => {
                        changed_elem.classList.add("fadeout");
                    }, 100);
                    window.setTimeout(() => {
                        popupFlg = false;
                        changed_elem.classList.remove("fade");
                        changed_elem.classList.remove("fadeout");
                    }, 600);
                }
            };
        })();
        fadeIcon.up();
    }
    function eventListener() {
        let pageElem_id_items = document.getElementById("items");
        pageElem_id_items.addEventListener("click", function (e) {
            if (e.target.classList.contains("item")) {
                let target = e.target;
                if (target.getAttribute("data-modified-title") !== null) {
                    editTitle.value = target.getAttribute("data-modified-title");
                }
                else {
                    editTitle.value = target.getAttribute("data-html").match(/(?:title=")(.*?)(?:")/)[1];
                }
                if (target.getAttribute("data-imagetitle-target") === null) {
                    target.setAttribute("data-imagetitle-target", target.getAttribute("data-syntax"));
                }
                targetItem = target;
                editTarget.value = target.getAttribute("data-imagetitle-target");
                editTitle.disabled = false;
                editChkBox.disabled = false;
                editChangeBtn.classList.remove("psne-fotolofe-helper-disabled");
                editChangeBtn.classList.add("psne-fotolofe-helper-enabled");
                editTargetImgURI.value = target.getAttribute("data-html").match(/img src="(.+)" alt="/)[1];
                editTargetImgBox.style.backgroundImage = "url(" + target.getAttribute("data-html").match(/img src="(.+)" alt="/)[1] + ")";
                if (syntaxMode === "markdown") {
                    change_syntaxMarkdown(target);
                }
                if (syntaxMode === "hatena") {
                    change_syntaxHatena(targetItem);
                }
                gaTracker.sendEvent("Edit", "Select", "Pictures");
            }
        }, false);
        editChangeBtn.addEventListener("click", function () {
            changeImgAttr();
            gaTracker.sendEvent("Edit", "Change", "TitleBtn");
        });
        document.querySelector("#editor-fotolife .paste-button").addEventListener("click", function () {
            gaTracker.sendEvent("Edit", "Insert", "Pictures");
        });
        editTitle.addEventListener("change", function () {
            if (!btn_change) {
                changeImgAttr();
            }
            gaTracker.sendEvent("Edit", "Change", "Title");
        });
        editChkBox.addEventListener("click", function () {
            if (!btn_change) {
                changeImgAttr();
            }
            gaTracker.sendEvent("Edit", "Change", "Cbox");
        });
        editTargetImgBox.addEventListener("click", function () {
            if (/Firefox\/(49|50)/.test(navigator.userAgent)) {
                return;
            }
            if (!editTargetImgURI.value) {
                return;
            }
            if (fotolifeImagePreview) {
                fotolifeImagePreview.postMessage({ request: "OpenUri", uri: editTargetImgURI.value });
            }
            else {
                chrome.runtime.sendMessage({ method: "HatenaBlogImage-OpenPreview" }, function (response) {
                });
            }
            gaTracker.sendEvent("Edit", "Open", "Preview");
        });
        chrome.runtime.onConnect.addListener(function (port) {
            fotolifeImagePreview = port;
            port.onMessage.addListener(function (msg) {
                if (msg.status === "Connect") {
                    port.postMessage({ request: "OpenUri", uri: editTargetImgURI.value });
                }
                if (msg.status === "Close") {
                    fotolifeImagePreview = null;
                }
            });
            port.onDisconnect.addListener(function () {
                fotolifeImagePreview = null;
            });
        });
    }
    function createToolBox() {
        editTitle = document.createElement("input");
        editTitle.id = "psne-fotolofe-helper-edit-title";
        editTitle.type = "text";
        editTitle.placeholder = "Title";
        editTitle.disabled = true;
        editAlt = document.createElement("input");
        editAlt.id = "psne-fotolofe-helper-edit-alt";
        editAlt.type = "text";
        editAlt.placeholder = "Alt";
        editAlt.disabled = true;
        editChkBox = document.createElement("input");
        editChkBox.id = "psne-fotolofe-helper-edit-cb";
        editChkBox.type = "checkbox";
        editChkBox.value = "1";
        editChkBox.disabled = true;
        let editChkBox_label = document.createElement("label");
        editChkBox_label.setAttribute("for", "psne-fotolofe-helper-edit-cb");
        editChkBox_label.textContent = "クリックで拡大しない";
        editChangeBtn = document.createElement("div");
        editChangeBtn.id = "psne-fotolofe-helper-submit";
        editChangeBtn.className = "psne-fotolofe-helper-btn psne-fotolofe-helper-disabled";
        editChangeBtn.textContent = "変更する";
        editTarget = document.createElement("input");
        editTarget.id = "psne-fotolofe-helper-edit-target";
        editTarget.type = "hidden";
        editTargetImgURI = document.createElement("input");
        editTargetImgURI.id = "psne-fotolofe-helper-edit-target-imguri";
        editTargetImgURI.type = "hidden";
        editTargetImgBox = document.createElement("div");
        editTargetImgBox.id = "psne-fotolofe-helper-image";
        editTargetImgBox.appendChild((function () {
            let elem = document.createElement("div");
            elem.id = "psne-fotolofe-helper-changed";
            elem.appendChild(document.createElement("i"));
            elem.firstElementChild.className = "blogicon-check lg";
            return elem;
        })());
        let elem_ID_psneFotolofeHelperOuter = document.createElement("div");
        elem_ID_psneFotolofeHelperOuter.id = "psne-fotolofe-helper-image-outer";
        elem_ID_psneFotolofeHelperOuter.appendChild(editTargetImgBox);
        let elem_ID_psneFotolofeHelperEdit = document.createElement("div");
        elem_ID_psneFotolofeHelperEdit.id = "psne-fotolofe-helper-edit";
        elem_ID_psneFotolofeHelperEdit.appendChild(editTitle);
        elem_ID_psneFotolofeHelperEdit.appendChild(document.createElement("br"));
        elem_ID_psneFotolofeHelperEdit.appendChild(editChkBox);
        elem_ID_psneFotolofeHelperEdit.appendChild(editChkBox_label);
        elem_ID_psneFotolofeHelperEdit.appendChild(document.createElement("br"));
        elem_ID_psneFotolofeHelperEdit.appendChild(editChangeBtn);
        elem_ID_psneFotolofeHelperEdit.appendChild(editTarget);
        elem_ID_psneFotolofeHelperEdit.appendChild(editTargetImgURI);
        let elem_ID_psneFotolofeHelperEditFooter = document.createElement("div");
        elem_ID_psneFotolofeHelperEditFooter.id = "psne-fotolofe-helper-edit-end";
        let elem_ID_psneFotolofeHelperInner = document.createElement("div");
        elem_ID_psneFotolofeHelperInner.id = "psne-fotolofe-helper-inner";
        if (syntaxMode === "markdown" && md_syntax === "hatena") {
            let errMsg_mode_hatena = document.createElement("div");
            errMsg_mode_hatena.id = "psne-fotolofe-helper-syntax-hatena";
            errMsg_mode_hatena.className = "error-box";
            errMsg_mode_hatena.textContent = "はてな記法では画像タイトルの変更ができません。";
            elem_ID_psneFotolofeHelperInner.appendChild(errMsg_mode_hatena);
        }
        else {
            elem_ID_psneFotolofeHelperInner.appendChild(elem_ID_psneFotolofeHelperOuter);
            elem_ID_psneFotolofeHelperInner.appendChild(elem_ID_psneFotolofeHelperEdit);
            elem_ID_psneFotolofeHelperInner.appendChild(elem_ID_psneFotolofeHelperEditFooter);
        }
        let elem_ID_psneFotolofeHelper = document.createElement("div");
        elem_ID_psneFotolofeHelper.id = "psne-fotolofe-helper";
        elem_ID_psneFotolofeHelper.appendChild(document.createElement("i"));
        elem_ID_psneFotolofeHelper.lastElementChild.className = "blogicon-plugin";
        elem_ID_psneFotolofeHelper.appendChild(document.createElement("i"));
        elem_ID_psneFotolofeHelper.lastElementChild.className = "blogicon-edit";
        elem_ID_psneFotolofeHelper.appendChild(document.createElement("span"));
        elem_ID_psneFotolofeHelper.lastElementChild.textContent = "画像のタイトル変えるやつ";
        elem_ID_psneFotolofeHelper.appendChild((function () {
            let elem = document.createElement("a");
            elem.setAttribute("href", "http://psn.hatenablog.jp/");
            elem.setAttribute("target", "_blank");
            elem.appendChild(document.createElement("i"));
            elem.firstElementChild.className = "blogicon-help tipsy-left";
            elem.firstElementChild.setAttribute("original-title", "この設定は id:psne が作成した拡張機能によるものです。クリックすると作者ページへアクセスできます。");
            return elem;
        })());
        elem_ID_psneFotolofeHelper.appendChild(elem_ID_psneFotolofeHelperInner);
        let appendToElement = document.getElementById(appendToElementId);
        appendToElement.appendChild(elem_ID_psneFotolofeHelper);
        if (syntaxMode === "markdown" && md_syntax === "hatena") {
            reCalculation_fotolifeItems(elem_ID_psneFotolofeHelper, 10);
            return;
        }
        eventListener();
        reCalculation_fotolifeItems(elem_ID_psneFotolofeHelper);
    }
    function reCalculation_fotolifeItems(elem_ID_psneFotolofeHelper, offset = 5) {
        let fotolifeItems = document.getElementById("items");
        fotolifeItems.style.height = (fotolifeItems.clientHeight - elem_ID_psneFotolofeHelper.clientHeight - offset) + "px";
    }
    function insertContentsButton() {
        var button = document.createElement("button");
        button.tabIndex = -1;
        button.id = "button-psn-contents";
        button.className = "button-psn-contents toolbar-button tipsy-top";
        button.setAttribute("data-action", "");
        button.setAttribute("data-track-name", "");
        button.setAttribute("original-title", "目次をつける");
        button.setAttribute("data-editor-syntax", syntaxMode);
        button.textContent = "目次";
        var elm = document.querySelector(".toolbar-more-container");
        elm.parentNode.insertBefore(button, elm);
        setTimeout(function () {
            button.disabled = false;
        }, 1000);
        let injectionScript = document.createElement("script");
        var injectionCode = function () {
            let button = document.getElementById("button-psn-contents");
            let syntax = button.getAttribute("data-editor-syntax");
            let content = syntax === "html" ? "<p>[:contents]<br /></p><p></p>" : "\n\n[:contents]\n\n";
            button.addEventListener("click", function () {
                if (syntax === "html") {
                    tinyMCE.activeEditor.execCommand("mceInsertContent", false, content);
                }
                else {
                    let activeEditor = document.getElementById("body");
                    let activeEditor_value = activeEditor.value;
                    activeEditor.value = activeEditor_value.substr(0, activeEditor.selectionStart)
                        + content
                        + activeEditor_value.substr(activeEditor.selectionStart, activeEditor_value.length);
                }
            });
        };
        injectionScript.type = "text/javascript";
        injectionScript.text = "(" + injectionCode.toString() + ")()";
        elm.parentNode.insertBefore(injectionScript, elm);
    }
    function load_settings() {
        let formElement = document.getElementById("edit-form");
        syntaxMode = formElement.syntax.value;
        insertContentsButton();
        chrome.runtime.sendMessage({ "method": "blogImageTitle-getSetting" }, function (response) {
            StorData = response.data;
            alt_change = StorData.updateAlt;
            title_change = StorData.updateTitle;
            btn_change = StorData.isUpdateBtn;
            md_syntax = StorData.mdModeSyntax;
            createToolBox();
            if (StorData.disableCbox) {
                editChkBox.checked = true;
            }
        });
    }
    function startUpBlogImage() {
        if (document.querySelector(execFlagElement)) {
            load_settings();
        }
        gaTracker.sendScreenView("Editview");
    }
    document.addEventListener("DOMContentLoaded", startUpBlogImage);
})();
