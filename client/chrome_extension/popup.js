const requestbutton = document.getElementById("requestbutton");
const startbutton = document.getElementById("startbutton");
const stopbutton = document.getElementById("stopbutton");
const inputbox = document.getElementById("inputbox");
const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const STATUSSTART = "start"
const STATUSEND = "end"
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

        notification(`code copied to clipboard \n
                      session started`)
        toggleButtonsOff();
    })
}

function handleResponse(response) {
    if (response.status == STATUSASK) {
        // notification(response.body);
        if (response.body == STATUSEND) {
            toggleButtonsOn();
        }
        if (response.body == STATUSSYNC) {
            toggleButtonsOff();
        }
    }
}
function sentMsgToContent(status, body = "") {
    chrome.tabs.query(params, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id,
            { "status": status, "body": body }, function (response) {
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
        sentMsgToContent(STATUSSTART, sessionPair.selfID);
        notification("session started")
        toggleButtonsOff();
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

function notification(body) {
    var $form = document.querySelectorAll('#signup-form')[0],
        $submit = document.querySelectorAll('#signup-form input[type="submit"]')[0],
        $message;

    $message = document.createElement('a');
    $message.classList.add('message');
    $form.appendChild($message);

    $message._show = function (type, text) {
        $message.innerHTML = text;
        $message.classList.add(type);
        $message.classList.add('visible');
        window.setTimeout(function () {
            $message._hide();
        }, 3000);
        $message._hide = function () {
            $message.classList.remove('visible');
        };
    }
    $submit.disabled = true;
    window.setTimeout(function () {
        $submit.disabled = false;
        $message._show('success', body);
    }, 750);
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