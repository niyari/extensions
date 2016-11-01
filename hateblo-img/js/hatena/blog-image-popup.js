(() => {
    "use strict";
    var gaTracker = new GATracker.Create("UA-33470797-7");
    gaTracker.sendScreenView("PopupView");
    let pop_hatenaID = document.getElementById("pop_hatenaID");
    let blog_edit = document.getElementById("blog_edit");
    let pop_options = document.getElementById("pop_options");
    let pop_write_blog = document.getElementById("pop_write_blog");
    let pop_twitter = document.getElementById("pop_twitter");
    let pop_hatebu = document.getElementById("pop_hatebu");
    let pop_subscribe = document.getElementById("pop_subscribe");
    let pop_googlep1 = document.getElementById("pop_googlep1");
    [pop_hatenaID, blog_edit, pop_options, pop_write_blog, pop_twitter, pop_hatebu, pop_subscribe, pop_googlep1]
        .forEach(eachElement);
    function eachElement(elem) {
        elem.addEventListener("click", onClickElem);
    }
    function onClickElem() {
        gaTracker.sendEvent("PopupPage", "Click", this.dataset.label);
        chrome.tabs.create({
            url: this.dataset.href,
            active: true
        }, onCreatedTab);
    }
    function onCreatedTab(tabInfo) {
        console.log(tabInfo.id);
    }
})();
