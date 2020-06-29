var urlPattern = [
    "https://*.bilibili.com/video/*",
    "https://www.dandanzan.com/*",
    "https://duonaolive.com/*",
    "https://v.qq.com/*",
    "https://www.iqiyi.com/*",
    "https://www.weiyun.com/*",
    "https://www.youtube.com/watch?*",
    "https://v.youku.com/*",
    "https://www.mgtv.com/*",
    "http://127.0.0.1/*",
    "http://music.jsososo.com/*",
    "file:///*"
];

function queryTabsAndShowPageActions(queryObject) {
    chrome.tabs.query(queryObject, (tabs) => {
        if (tabs && tabs.length > 0) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].status === "complete") {
                    chrome.pageAction.show(tabs[i].id);
                }
            }
        }
    }
    );
}

chrome.runtime.onInstalled.addListener(function () {
    queryTabsAndShowPageActions({
        "active": false,
        "currentWindow": true,
        "url": urlPattern
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    queryTabsAndShowPageActions({
        "active": true,
        "currentWindow": true,
        "url": urlPattern
    });
});

chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version
    const previousVersion = details.previousVersion
    const reason = details.reason

    switch (reason) {
        case 'install':
            window.open("https://onns.xyz/sync-sofa/", "_blank");
            break;
        case 'update':
            window.open("https://onns.xyz/sync-sofa/", "_blank");
            break;
        case 'chrome_update':
        case 'shared_module_update':
        default:
            console.log('Other install events within the browser')
            break;
    }

})