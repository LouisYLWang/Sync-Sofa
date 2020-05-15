var urlPattern = [
    "https://*.bilibili.com/video/*",
    "https://www.dandanzan.com/*",
    "https://duonaolive.com/play*",
    "https://v.qq.com/*",
    "https://www.iqiyi.com/*",
    "https://www.weiyun.com/*",
    "https://www.youtube.com/*",
    "https://v.youku.com/*",
    "http://127.0.0.1/*",
    "file:///*"
];  

function queryTabsAndShowPageActions(queryObject) {  
    chrome.tabs.query(queryObject, (tabs) => {  
            if (tabs && tabs.length > 0) {  
                for (var i = 0; i < tabs.length; i++) {  
                    if (tabs[i].status === "complete"){
                        chrome.pageAction.show(tabs[i].id);  
                    } 
                }  
            }  
        }  
    );  
}  

chrome.runtime.onInstalled.addListener(function() {  
    queryTabsAndShowPageActions({  
        "active": false,  
        "currentWindow": true,  
        "url": urlPattern  
    });  
});  

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab)=> {  
    queryTabsAndShowPageActions({  
        "active": true,  
        "currentWindow": true,  
        "url": urlPattern  
    });  
});  