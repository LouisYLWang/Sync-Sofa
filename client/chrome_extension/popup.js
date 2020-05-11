const requestbutton = document.getElementById("requestbutton");
const startbutton = document.getElementById("startbutton");
const stopbutton = document.getElementById("stopbutton");
const inputbox = document.getElementById("inputbox");
const PAUSECODE = "-5";
const PLAYCODE = "-4";
const HELLOCODE = "-3";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSCONNECT = "connect"
const STATUSSYNC = "sync"
const STATUSASK = "ask"
const apihost = "app.ylwang.me"

const params = {
    active: true,
    currentWindow: true
}

var status = "end"
var defaultHost = ""
var selfID = ""

requestbutton.addEventListener("click", e => {
    e.preventDefault();
    handleCreateHostSession(e)
})

startbutton.addEventListener("click", e => {
    e.preventDefault();
    handleBeginSessions(e)
})

inputbox.addEventListener("click", e => {
    e.preventDefault();
    if (requestbutton.style.display === "block") {
        requestbutton.style.display = "none";
    }
})

stopbutton.addEventListener("click", e => {
    e.preventDefault();
    sentMsgToContent(STATUSEND)
    toggleButtonsOn();
    if (inputbox.value !== "") {
        inputbox.value = "";
    }
})

function handleCreateHostSession(e) {
    e.preventDefault();
    let url = `https://${apihost}/v1/session`
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status < 300) {
            return res.json();
        }
        return res.text();
    }).then(data => {
        sessionPair = JSON.parse(JSON.stringify(data));
        if (sessionPair != null) {
            inputbox.value = sessionPair.selfID;
        }
        chrome.storage.local.set({ "selfID": sessionPair.selfID }, function () { });
        sentMsgToContent(STATUSSTART, sessionPair.selfID);
        inputbox.select();
        document.execCommand("copy");
        toggleButtonsOff();
        setTimeout(function () {
            window.close();
        }, 3000);
    })
}

function handleResponse(response) {
    if (response.status == STATUSASK) {
        if (response.body == STATUSEND) {
            toggleButtonsOn();
        }
        if (response.body == STATUSCONNECT) {
            toggleButtonsOff();
        }
    }
}
function sentMsgToContent(status, body = "", message = {}) {
    chrome.tabs.query(params, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id,
            { "status": status, "body": body, "message": message }, function (response) {
                handleResponse(response);
            });
    });
}

function handleBeginSessions(e) {
    e.preventDefault();
    let url = `https://${apihost}/v1/session/?id=${inputbox.value}`
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status < 300) {
            return res.json();
        }
        return res.text();
    }).then(data => {
        sessionPair = JSON.parse(JSON.stringify(data));
        if (sessionPair != null) {
            inputbox.value = sessionPair.selfID;
        }
        sentMsgToContent(STATUSSTART, sessionPair.selfID, { "beginFlag": true });
        toggleButtonsOff();
        setTimeout(function () {
            window.close();
        }, 3000);
    })
}


function toggleButtonsOff() {
    startbutton.style.display = "none";
    requestbutton.style.display = "none";
    stopbutton.style.display = "block";
}

function toggleButtonsOn() {
    selfID = "";
    inputbox.value = selfID;
    startbutton.style.display = "block";
    requestbutton.style.display = "block";
    stopbutton.style.display = "none";
}

function initialize() {
    chrome.storage.local.get(['selfID'], function (result) {
        if (result.selfID != undefined) {
            selfID = result.selfID;
            inputbox.value = selfID;
            requestbutton.value = "REQUEST NEW CODE";
        }
    });
    sentMsgToContent(STATUSASK);
}
initialize();