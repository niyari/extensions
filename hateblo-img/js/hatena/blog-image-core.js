var Htn;
(function (Htn) {
    var blogImageTitle;
    (function (blogImageTitle) {
        "use strict";
        blogImageTitle.defaults = {
            settings: {
                updateAlt: true,
                updateTitle: true,
                mdModeSyntax: "hatena",
                disableCbox: true,
                isUpdateBtn: true,
                creditText: ""
            }
        };
        blogImageTitle.settings = {};
    })(blogImageTitle = Htn.blogImageTitle || (Htn.blogImageTitle = {}));
})(Htn || (Htn = {}));
var Htn;
(function (Htn) {
    var blogImageTitle;
    (function (blogImageTitle) {
        var background;
        (function (background) {
            "use strict";
            function addListener() {
                initStorage();
                openPreviewWindowListener();
                sendStorageDataListener();
                putStorageDataListener();
            }
            background.addListener = addListener;
            function openPreviewWindowListener() {
                chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (request.method === "HatenaBlogImage-OpenPreview") {
                        let createPalam = {
                            url: "/html/hatena/blog-image-preview.html#tabid=" + sender.tab.id
                        };
                        createPalam.type = "normal";
                        createPalam.height = 400;
                        createPalam.width = 600;
                        if (location.protocol === "chrome-extension:") {
                            createPalam.type = "popup";
                            createPalam.focused = true;
                        }
                        chrome.windows.create(createPalam, function (window) {
                            sendResponse({
                                tabid: sender.tab.id,
                                msg: sender.tab.id
                            });
                        });
                    }
                });
            }
            function sendStorageDataListener() {
                chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (request.method === "blogImageTitle-getSetting") {
                        sendResponse({
                            data: Htn.blogImageTitle.Setting.get()
                        });
                    }
                });
            }
            function putStorageDataListener() {
                chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (request.method === "blogImageTitle-putSetting") {
                        Htn.blogImageTitle.Setting.put(request.key, request.value);
                    }
                });
            }
            function initStorage() {
                "use strict";
                let StorageKeyName = "blogImageTitle";
                let data = localStorage.getItem(StorageKeyName);
                try {
                    if (data === null) {
                        localStorage.setItem(StorageKeyName, JSON.stringify(Htn.blogImageTitle.defaults));
                        Htn.blogImageTitle.settings = Htn.blogImageTitle.defaults.settings;
                    }
                    else {
                        let storageData = JSON.parse(data);
                        Htn.blogImageTitle.settings = storageData.settings;
                    }
                }
                catch (e) {
                    localStorage.setItem(StorageKeyName, JSON.stringify(Htn.blogImageTitle.defaults));
                    Htn.blogImageTitle.settings = Htn.blogImageTitle.defaults.settings;
                }
            }
        })(background = blogImageTitle.background || (blogImageTitle.background = {}));
    })(blogImageTitle = Htn.blogImageTitle || (Htn.blogImageTitle = {}));
})(Htn || (Htn = {}));
var Htn;
(function (Htn) {
    var blogImageTitle;
    (function (blogImageTitle) {
        var Setting;
        (function (Setting) {
            "use strict";
            let StorageKeyName = "blogImageTitle";
            function get() {
                Htn.blogImageTitle.settings = Htn.API.Storage.get(StorageKeyName, "settings");
                Object.keys(Htn.blogImageTitle.defaults.settings).map((key) => {
                    try {
                        if (Htn.blogImageTitle.settings[key] === undefined) {
                            Htn.blogImageTitle.settings[key] = Htn.blogImageTitle.defaults.settings[key];
                            Htn.blogImageTitle.Setting.put(key, Htn.blogImageTitle.defaults.settings[key]);
                        }
                    }
                    catch (e) {
                        Htn.blogImageTitle.settings = Htn.blogImageTitle.defaults.settings;
                        localStorage.setItem(StorageKeyName, JSON.stringify(Htn.blogImageTitle.defaults));
                    }
                });
                return Htn.blogImageTitle.settings;
            }
            Setting.get = get;
            function put(key, value) {
                if (!key) {
                    return;
                }
                let storageData = Htn.API.Storage.get(StorageKeyName, "settings");
                if (storageData === null) {
                    storageData = {};
                }
                storageData[key] = value;
                Htn.blogImageTitle.settings = storageData;
                Htn.API.Storage.put(StorageKeyName, "settings", storageData);
            }
            Setting.put = put;
        })(Setting = blogImageTitle.Setting || (blogImageTitle.Setting = {}));
    })(blogImageTitle = Htn.blogImageTitle || (Htn.blogImageTitle = {}));
})(Htn || (Htn = {}));
var Htn;
(function (Htn) {
    var API;
    (function (API) {
        var Storage;
        (function (Storage) {
            "use strict";
            let storageData;
            function get(StorageKeyName, key) {
                if (!StorageKeyName || !key) {
                    return null;
                }
                storageData = JSON.parse(localStorage.getItem(StorageKeyName));
                return storageData[key];
            }
            Storage.get = get;
            function put(StorageKeyName, key, value) {
                if (!StorageKeyName || !key) {
                    return;
                }
                storageData = JSON.parse(localStorage.getItem(StorageKeyName));
                if (storageData === null) {
                    storageData = {};
                }
                storageData[key] = value;
                localStorage.setItem(StorageKeyName, JSON.stringify(storageData));
            }
            Storage.put = put;
            function remove(StorageKeyName, key) {
                if (!StorageKeyName || !key) {
                    return;
                }
                storageData = JSON.parse(localStorage.getItem(StorageKeyName));
                delete storageData[key];
                localStorage.setItem(StorageKeyName, JSON.stringify(storageData));
            }
            Storage.remove = remove;
        })(Storage = API.Storage || (API.Storage = {}));
    })(API = Htn.API || (Htn.API = {}));
})(Htn || (Htn = {}));
var Htn;
(function (Htn) {
    var API;
    (function (API) {
        var Notify;
        (function (Notify) {
            "use strict";
            let que = [];
            let notyifInfo = {};
            let notifyName = chrome.runtime.getManifest().name;
            let closeTime = 30000;
            let delayedTime = 3000;
            setupListeners();
            function basic(title, message, iconURL, actionURL, priority = 0, buttons, buttonsURL) {
                let alarmInfo = {
                    type: "basic",
                    iconUrl: iconURL,
                    title: title,
                    message: message,
                    priority: 0,
                    actionURL: actionURL,
                    buttonsURL: buttonsURL
                };
                if (typeof buttons !== "undefined") {
                    alarmInfo.buttons = buttons;
                }
                que.push(alarmInfo);
                chrome.alarms.create("Notification-dequeue", { when: Date.now() + 300 });
                return;
            }
            Notify.basic = basic;
            function image(title, message, iconURL, imageURL, actionURL, priority = 0, buttons, buttonsURL) {
                let alarmInfo = {
                    type: "image",
                    iconUrl: iconURL,
                    title: title,
                    message: message,
                    imageUrl: imageURL,
                    priority: 0,
                    actionURL: actionURL,
                    buttonsURL: buttonsURL
                };
                if (typeof buttons !== "undefined") {
                    alarmInfo.buttons = buttons;
                }
                que.push(alarmInfo);
                chrome.alarms.create("Notification-dequeue", { when: Date.now() + 300 });
                return;
            }
            Notify.image = image;
            function list(title, message, iconURL, listItems, actionURL, priority = 0, buttons, buttonsURL) {
                let alarmInfo = {
                    type: "list",
                    iconUrl: iconURL,
                    title: title,
                    message: message,
                    priority: 0,
                    actionURL: actionURL,
                    buttonsURL: buttonsURL
                };
                if (typeof listItems !== "undefined") {
                    alarmInfo.items = listItems;
                }
                else {
                    alarmInfo.type = "basic";
                }
                if (typeof buttons !== "undefined") {
                    alarmInfo.buttons = buttons;
                }
                que.push(alarmInfo);
                chrome.alarms.create("Notification-dequeue", { when: Date.now() + 300 });
                return;
            }
            Notify.list = list;
            function progress() {
                return;
            }
            Notify.progress = progress;
            function dequeueJob() {
                let alarmInfo = que.shift();
                if (!alarmInfo) {
                    return;
                }
                let notifyID = notifyName + String(+new Date());
                notyifInfo[notifyID] = JSON.parse(JSON.stringify(alarmInfo));
                delete alarmInfo.actionURL;
                delete alarmInfo.buttonsURL;
                chrome.notifications.create(notifyID, alarmInfo, function () {
                    chrome.alarms.create("Notification-delete<>" + notifyID, { when: Number(Date.now() + closeTime) });
                });
                if (que.length > 0) {
                    chrome.alarms.create("Notification-dequeue", { when: Number(Date.now() + delayedTime) });
                }
            }
            function setupListeners() {
                chrome.alarms.onAlarm.addListener(function (alarm) {
                    if (alarm) {
                        var command = alarm.name.split("<>", 2);
                        switch (command[0]) {
                            case "Notification-dequeue":
                                dequeueJob();
                                break;
                            case "Notification-delete":
                                chrome.notifications.clear(command[1], function (wasCleared) {
                                });
                                delete notyifInfo[command[1]];
                                break;
                            default:
                                break;
                        }
                    }
                });
                chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
                    dequeueJob();
                });
                chrome.notifications.onClicked.addListener(function (notificationId) {
                    var info = notyifInfo[notificationId];
                    if (typeof info.actionURL === "undefined"
                        || info.actionURL === "" || info.actionURL === null) {
                        console.log("URL指定ありませんa");
                    }
                    else {
                        console.log("onClicked Notify ID:" + notificationId + " " + info.actionURL);
                        chrome.tabs.create({ url: info.actionURL }, function (tab) {
                            chrome.tabs.update(tab.id, { highlighted: true });
                            chrome.windows.update(tab.windowId, { focused: true });
                        });
                    }
                    chrome.notifications.clear(notificationId, function (wasCleared) {
                    });
                });
                chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
                    let info = notyifInfo[notificationId];
                    if (typeof info.buttonsURL === "undefined") {
                        console.log("Notify ボタンクリック URL指定ありません0");
                        return;
                    }
                    if (typeof info.buttonsURL[buttonIndex] === undefined
                        || info.buttonsURL[buttonIndex] === "" || info.buttonsURL[buttonIndex] === null) {
                        console.log("Notify ボタンクリック URL指定ありません1");
                    }
                    else {
                        chrome.tabs.create({ url: info.buttonsURL[buttonIndex] }, function (tab) {
                            chrome.tabs.update(tab.id, { highlighted: true });
                            chrome.windows.update(tab.windowId, { focused: true });
                        });
                    }
                    chrome.notifications.clear(notificationId, function (wasCleared) {
                    });
                });
            }
        })(Notify = API.Notify || (API.Notify = {}));
    })(API = Htn.API || (Htn.API = {}));
})(Htn || (Htn = {}));
