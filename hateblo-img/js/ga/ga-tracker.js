var GATracker;
(function (GATracker) {
    "use strict";
    let isDebug = false;
    const StorageKeyName = "GATracker";
    const defaults = {
        storage: {
            settings: {
                clientId: null,
                optoutGA: false
            },
            version: "0.7.0.3"
        },
        trackerId: "UA-XXXXX-YY",
        viewName: "unknownView"
    };
    let storageData = defaults.storage;
    let isBackGround = false;
    if (location.protocol === "chrome-extension:" ||
        location.protocol === "ms-browser-extension:" ||
        location.protocol === "moz-extension:" &&
            (location.pathname === "/_generated_background_page.html" || location.pathname === "/_blank.html")) {
        storageUpdate();
        isBackGround = true;
        getStorage();
        bg_addListener();
        migrate_ChromeAnalyticsBundle();
    }
    else {
        getSettings();
        cli_addListener();
    }
    function storageUpdate() {
        let storage = localStorage.getItem(StorageKeyName);
        if (storage === null) {
            return;
        }
        let storageTemp = JSON.parse(storage);
        if (storageTemp.version === undefined) {
            if (storageTemp.settings === undefined) {
                storageTemp.settings = {};
            }
            if (storage.indexOf("true")) {
                storageTemp.settings.optoutGA = true;
            }
            else {
                storageTemp.settings.optoutGA = false;
            }
            localStorage.setItem(StorageKeyName, JSON.stringify(storageTemp));
        }
        if (storageTemp.version !== storageData.version) {
            if (storageTemp.version === "0.7.0.2") {
                if (storageTemp.settings.notTrackGA !== undefined) {
                    storageTemp.settings.optoutGA = storageTemp.settings.notTrackGA;
                    storageTemp.settings.notTrackGA = undefined;
                }
            }
            storageTemp.version = defaults.storage.version;
            localStorage.setItem(StorageKeyName, JSON.stringify(storageTemp));
        }
    }
    function migrate_ChromeAnalyticsBundle() {
        chrome.storage.local.get(function (data) {
            if (data["google-analytics.analytics.user-id"]) {
                putSettings("clientId", data["google-analytics.analytics.user-id"]);
                chrome.storage.local.remove("google-analytics.analytics.tracking-permitted");
                chrome.storage.local.remove("google-analytics.analytics.user-id");
            }
        });
    }
    function getStorage() {
        if (isBackGround === false) {
            return;
        }
        storageData = JSON.parse(localStorage.getItem(StorageKeyName));
        if (storageData === null) {
            localStorage.setItem(StorageKeyName, JSON.stringify(defaults.storage));
            storageData = defaults.storage;
        }
        Object.keys(defaults.storage.settings).map((key) => {
            if (storageData.settings[key] === undefined) {
                storageData.settings[key] = defaults.storage.settings[key];
                localStorage.setItem(StorageKeyName, JSON.stringify(storageData));
            }
        });
        if (storageData.settings.clientId === null) {
            storageData.settings.clientId = generateUuid();
            localStorage.setItem(StorageKeyName, JSON.stringify(storageData));
        }
    }
    function putStorage(key, value) {
        if (isBackGround === false) {
            return;
        }
        if (!key || value === undefined) {
            return;
        }
        ;
        storageData.settings[key] = value;
        localStorage.setItem(StorageKeyName, JSON.stringify(storageData));
    }
    function getSettings() {
        if (isBackGround === true) {
            getStorage();
            return;
        }
        chrome.runtime.sendMessage({ method: "GATracker-getStorage" }, (response) => {
            storageData = response.data;
        });
    }
    GATracker.getSettings = getSettings;
    function putSettings(key, value) {
        if (isBackGround === true) {
            putStorage(key, value);
            bg_sendSettings();
            return;
        }
        chrome.runtime.sendMessage({ method: "GATracker-putSettings", key: key, value: value });
    }
    GATracker.putSettings = putSettings;
    function bg_addListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.method === "GATracker-getStorage") {
                getStorage();
                sendResponse({
                    data: storageData
                });
            }
            if (request.method === "GATracker-putSettings") {
                putStorage(request.key, request.value);
                bg_sendSettings();
            }
        });
    }
    function bg_sendSettings() {
        chrome.runtime.sendMessage({ method: "GATracker-updateStorage", data: storageData });
    }
    function cli_addListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.method === "GATracker-updateStorage") {
                storageData = request.data;
            }
        });
    }
    function generateUuid() {
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }
    GATracker.generateUuid = generateUuid;
    class Create {
        constructor(trackerId = defaults.trackerId) {
            this.trackerId = trackerId;
            Create.service = Create.API_getService();
            Create.setData();
            Create.tracker = Create.API_getTracker(trackerId);
            debug("Create トラッキングID:", trackerId);
        }
        static setData() {
            if (isBackGround) {
                Create.service.libVersion = storageData.version;
                Create.service.clientId = storageData.settings.clientId;
                if (storageData.settings.optoutGA) {
                    debug("TrackingPermitted データの送信を行わない", true);
                }
                else {
                    debug("TrackingPermitted データの送信を行わない", false);
                }
            }
            else {
                chrome.runtime.sendMessage({ method: "GATracker-getStorage" }, (response) => {
                    storageData = response.data;
                    Create.service.libVersion = storageData.version;
                    Create.service.clientId = storageData.settings.clientId;
                    if (storageData.settings.optoutGA) {
                        debug("TrackingPermitted データの送信を行わない", true);
                    }
                    else {
                        debug("TrackingPermitted データの送信を行わない", false);
                    }
                });
            }
        }
        static sendScreenView(viewName) {
            if (Create.tracker === undefined || storageData.settings.optoutGA) {
                debug("sendScreenView 準備が完了していません。", viewName);
                return;
            }
            let sendParam = Object.assign({}, Create.tracker.param);
            sendParam.hitType = "appview";
            sendParam.description = viewName;
            Create.sendAnalytics(sendParam);
        }
        static sendEvent(eventCategory, eventAction, eventLabel, eventValue) {
            if (Create.tracker === undefined || storageData.settings.optoutGA) {
                return;
            }
            if (eventCategory === undefined) {
                return;
            }
            if (eventAction === undefined) {
                eventAction = null;
            }
            if (eventValue !== undefined && eventValue < 0) {
                eventValue = 0;
            }
            if (eventValue !== undefined) {
                eventValue = Math.floor(eventValue);
            }
            let sendParam = Object.assign({}, Create.tracker.param);
            sendParam.hitType = "event";
            sendParam.eventCategory = eventCategory;
            sendParam.eventAction = eventAction;
            sendParam.eventLabel = eventLabel;
            sendParam.eventValue = eventValue;
            Create.sendAnalytics(sendParam);
        }
        static startTiming(category, variable) {
            if (Create.tracker === undefined) {
                return;
            }
            Create.timing = {};
            Create.timing.t = "timing";
            Create.timing.utc = category;
            Create.timing.utv = variable;
            Create.timing.timingStart = new Date();
        }
        static sendTiming() {
            if (Create.timing === undefined || storageData.settings.optoutGA) {
                return;
            }
            let timingStop = new Date();
            let sendParam = Object.assign({}, Create.tracker.param);
            sendParam.hitType = "timing";
            sendParam.timingCategory = Create.timing.utc;
            sendParam.timingVar = Create.timing.utv;
            sendParam.timingValue = timingStop.getTime() - Create.timing.timingStart.getTime();
            Create.sendAnalytics(sendParam);
        }
        static sendCustomDimension(category, action, label, value, dim) {
            if (Create.tracker === undefined || storageData.settings.optoutGA) {
                return;
            }
            debug("TrackCustomDimension ", {
                "category": category, "action": action,
                "label": label, "dim": dim, "value": value
            });
        }
        sendScreenView(viewName = defaults.viewName) {
            Create.sendScreenView(viewName);
        }
        sendEvent(eventCategory, eventAction, eventLabel, eventValue) {
            Create.sendEvent(eventCategory, eventAction, eventLabel, eventValue);
        }
        startTiming(category, variable) {
            Create.startTiming(category, variable);
        }
        sendTiming() {
            Create.sendTiming();
        }
        sendCustomDimension(category, action, label, value, dim) {
            Create.sendCustomDimension(category, action, label, value, dim);
        }
        static API_getService() {
            let GAService = {};
            let Manifest = chrome.runtime.getManifest();
            GAService.appName = Manifest.name;
            GAService.appVersion = Manifest.version;
            GAService.trackingId = undefined;
            GAService.libVersion = undefined;
            GAService.apiVersion = "1";
            GAService.language = navigator.language;
            GAService.screenColors = window.screen.colorDepth + "-bit";
            GAService.screenResolution = window.parent.screen.width + "x" + window.parent.screen.height;
            GAService.viewportSize = document.documentElement.clientWidth + "x" + document.documentElement.clientHeight;
            GAService.clientId = undefined;
            GAService.sampleRateOverride = 100;
            return GAService;
        }
        static API_getTracker(trackerId) {
            let Tracker = {
                param: {}, setting: {}, hitLimit: 20, que: [],
                hitTimer: setInterval(() => {
                    Tracker.hitLimit += 2;
                    if (Tracker.hitLimit > 20) {
                        Tracker.hitLimit = 20;
                    }
                    if (Tracker.que.length > 1) {
                        Create.deQue();
                    }
                }, 1000)
            };
            Tracker.param = Object.assign({}, Create.service);
            Tracker.param.trackingId = trackerId;
            return Tracker;
        }
        static sendAnalytics(query) {
            if (Math.floor(Math.random() * 100) - (100 - Create.service.sampleRateOverride) < 0) {
                return;
            }
            Create.enQue(query);
        }
        static enQue(query) {
            Create.tracker.que.push(query);
            Create.deQue();
        }
        static deQue() {
            if (Create.tracker.hitLimit < 1) {
                return;
            }
            Create.sendAnalyticsServer(Create.tracker.que.shift());
            if (Create.tracker.que.length > 0) {
                Create.deQue();
            }
        }
        static sendAnalyticsServer(query) {
            if (query === null || query === undefined) {
                return;
            }
            Create.tracker.hitLimit--;
            const GA_SERVER = "https://www.google-analytics.com/collect";
            let XHR = new XMLHttpRequest();
            let urlEncodedData;
            const dataBuild = function (query) {
                let params = [];
                for (var key of Object.keys(query)) {
                    params.push(`${encodeURIComponent(Create.convertRequestKey(key))}=${encodeURIComponent(query[key])}`);
                }
                return params.join("&").replace(/%20/g, "+");
            };
            urlEncodedData = dataBuild(query);
            XHR.open("POST", GA_SERVER, true);
            XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
            XHR.send(urlEncodedData);
            return;
        }
        static convertRequestKey(key) {
            switch (key) {
                case "anonymizeIp":
                    return "aip";
                case "apiVersion":
                    return "v";
                case "appName":
                    return "an";
                case "appVersion":
                    return "av";
                case "clientId":
                    return "cid";
                case "language":
                    return "ul";
                case "libVersion":
                    return "_v";
                case "sampleRateOverride":
                    return "usro";
                case "screenColors":
                    return "sd";
                case "screenResolution":
                    return "sr";
                case "trackingId":
                    return "tid";
                case "viewportSize":
                    return "vp";
                case "hitType":
                    return "t";
                case "queueTime":
                    return "qt";
                case "cacheBuster":
                    return "z";
                case "sessionControl":
                    return "sc";
                case "sessionGroup":
                    return "sg";
                case "userId":
                    return "uid";
                case "nonInteraction":
                    return "ni";
                case "description":
                    return "cd";
                case "title":
                    return "dt";
                case "appId":
                    return "aid";
                case "appInstallerId":
                    return "aiid";
                case "eventCategory":
                    return "ec";
                case "eventAction":
                    return "ea";
                case "eventLabel":
                    return "el";
                case "eventValue":
                    return "ev";
                case "socialNetwork":
                    return "sn";
                case "socialAction":
                    return "sa";
                case "socialTarget":
                    return "st";
                case "transactionId":
                    return "ti";
                case "transactionAffiliation":
                    return "ta";
                case "transactionRevenue":
                    return "tr";
                case "transactionShipping":
                    return "ts";
                case "transactionTax":
                    return "tt";
                case "currencyCode":
                    return "cu";
                case "itemPrice":
                    return "ip";
                case "itemQuantity":
                    return "iq";
                case "itemCode":
                    return "ic";
                case "itemName":
                    return "in";
                case "itemCategory":
                    return "iv";
                case "campaignSource":
                    return "cs";
                case "campaignMedium":
                    return "cm";
                case "campaignName":
                    return "cn";
                case "campaignKeyword":
                    return "ck";
                case "campaignContent":
                    return "cc";
                case "campaignId":
                    return "ci";
                case "gclid":
                    return "gclid";
                case "dclid":
                    return "dclid";
                case "pageLoadTime":
                    return "plt";
                case "dnsTime":
                    return "dns";
                case "tcpConnectTime":
                    return "tcp";
                case "serverResponseTime":
                    return "srt";
                case "pageDownloadTime":
                    return "pdt";
                case "redirectResponseTime":
                    return "rrt";
                case "timingCategory":
                    return "utc";
                case "timingVar":
                    return "utv";
                case "timingValue":
                    return "utt";
                case "timingLabel":
                    return "utl";
                case "exDescription":
                    return "exd";
                case "exFatal":
                    return "exf";
                default:
                    return key;
            }
        }
    }
    GATracker.Create = Create;
    function debug(label, value) {
        if (isDebug && label) {
            if (value !== undefined) {
                console.log(label, value);
            }
            else {
                console.log(label);
            }
        }
    }
})(GATracker || (GATracker = {}));
