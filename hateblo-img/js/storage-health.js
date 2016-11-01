(() => {
    try {
        let storageData;
        storageData = JSON.parse(localStorage.getItem("blogImageTitle"));
        if (storageData === null) {
            return;
        }
        storageData.settings.updateAlt = false;
    }
    catch (e) {
        console.log("broken storage blogImageTitle");
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
        localStorage.setItem("blogImageTitle", JSON.stringify(blogImageTitle));
    }
})();
(() => {
    try {
        let storageData;
        storageData = JSON.parse(localStorage.getItem("GATracker"));
        if (storageData === null) {
            return;
        }
        storageData.settings.optoutGA = false;
    }
    catch (e) {
        console.log("broken storage GATracker");
        let GA_storage = {
            settings: {
                optoutGA: false,
                clientId: null
            },
            version: "0.7.0.3"
        };
        localStorage.setItem("GATracker", JSON.stringify(GA_storage));
    }
})();
