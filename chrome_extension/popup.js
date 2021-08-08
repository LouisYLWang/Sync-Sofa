// const requestbutton = document.getElementById("requestbutton");
const startbutton = document.getElementById("startbutton");
const stopbutton = document.getElementById("stopbutton");
const inputbox = document.getElementById("inputbox");
const usernamebox = document.getElementById("username");
const footerbuttons = document.getElementById("footerbuttons");
// const cancelbutton = document.getElementById("cancelbutton");
const chatbutton = document.getElementById("chatbutton");
const videotbutton = document.getElementById("videotbutton");

const PAUSECODE = "-5";
const PLAYCODE = "-4";
const HELLOCODE = "-3";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSCHAT = "chat"
const STATUSVIDEO = "video"
const STATUSCONNECT = "connect"
const STATUSSYNC = "sync"
const STATUSASK = "ask"
const STATUSUNREADY = "unready"
const STATUSREADY = "ready"
const STATUSMESSAGE = "message"
var apihost = "app.ylwang.me"
var protocol = "https"
var sid = ""
var username = ""
//var statuschat;
chrome.storage.local.get("chat", result => {
    if (result.chat == undefined) {
        chrome.storage.local.set({
            'chat': false
        });
    } else {
        chatbutton.checked = result.chat;
    }
})

chrome.storage.local.get("video", result => {
    console.log(result.video);
    if (result.video == undefined) {
        chrome.storage.local.set({
            'video': false
        });
    } else {
        videotbutton.checked = result.video;
    }
})

chrome.storage.local.get(['apihost'], function (result) {
    if (result.apihost != undefined && result.apihost != "app.ylwang.me") {
        apihost = result.apihost;
    };
});

chrome.storage.local.get(['protocol'], function (result) {
    if (result.protocol != undefined && result.protocol != "https") {
        protocol = result.protocol;
    };
});

const params = {
    active: true,
    currentWindow: true
}

var status = "end"
var defaultHost = ""
var sid = ""


startbutton.addEventListener("click", e => {
    e.preventDefault();
    UIStatusToLinked();
    handleBeginSessions(e)
})

inputbox.addEventListener("click", e => {
    e.preventDefault();
    // if (requestbutton.style.display === "block") {
    //     requestbutton.style.display = "none";
    //     cancelbutton.style.display = "block";
    // }
})

stopbutton.addEventListener("click", e => {
    e.preventDefault();
    sentMsgToContent(STATUSEND)
    UIStatusToInit();
    // if (inputbox.value !== "") {
    //     inputbox.value = "";
    // }
})

chatbutton.addEventListener("change", e => {
    e.preventDefault();
    chrome.storage.local.get(['chat'], result => {
        console.log(result.chat);
        chatbutton.checked = !result.chat;
        chrome.storage.local.set({
            'chat': !result.chat
        });
    });
    sentMsgToContent(STATUSCHAT);
})

// cancelbutton.addEventListener("click", e => {
//     e.preventDefault();
//     UIStatusToInit();
//     if (inputbox.value !== "") {
//         inputbox.value = "";
//     }
// })

videotbutton.addEventListener("change", e => {
    e.preventDefault();
    chrome.storage.local.get(['video'], result => {
        console.log(result.video);
        videotbutton.checked = !result.video;
        chrome.storage.local.set({
            'video': !result.video
        });
    });
    sentMsgToContent(STATUSVIDEO);
})

async function handleResponse(response) {
    if (response == undefined) {
        UIStatusToUnready();
        return;
    }
    if (response.status == STATUSASK) {
        if (response.body == STATUSUNREADY) {
            UIStatusToUnready();
        }
        if (response.body == STATUSREADY) {
            UIStatusToready();
        }
        if (response.body == STATUSEND) {
            UIStatusToInit();
        }
        if (response.body == STATUSCONNECT) {
            UIStatusToLinked();
        }
        if (response.body == STATUSSYNC) {
            UIStatusToLinked();
        }
    }
}

function sentMsgToContent(status, message = "") {
    chrome.tabs.query(params, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id,
            { "status": status, "body": message }, function (response) {
                handleResponse(response);
            });
    });
}

function handleBeginSessions(e) {
    e.preventDefault();
    let url = `${protocol}://${apihost}/v2/session/?id=${inputbox.value}&name=${usernamebox.value}`
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
            if (sessionPair.sid == "") {
                sentMsgToContent(STATUSMESSAGE, "Something error happens");
                UIStatusToInit();
                return;
            }
            inputbox.value = sessionPair.sid
        }
        chrome.storage.local.set({ "sid": sessionPair.sid, "username": usernamebox.value }, function () { });
        sentMsgToContent(STATUSSTART);
        UIStatusToLinked();
        setTimeout(function () {
            window.close();
        }, 3000);
    })
}


function UIStatusToLinked() {
    startbutton.style.display = "none";
    // requestbutton.style.display = "none";
    stopbutton.style.display = "block";
    chrome.storage.local.get("chat", result => {
        if (result.chat) {
            chatbutton.style.display = "block";
        } else {
            chatbutton.style.display = "none";
        };
    })
    chrome.storage.local.get("video", result => {
        if (result.video) {
            videotbutton.style.display = "block";
        } else {
            videotbutton.style.display = "none";
        };
    })
}

function UIStatusToInit() {
    // sid = "";
    // inputbox.value = sid;
    startbutton.style.display = "block";
    // requestbutton.style.display = "block";
    stopbutton.style.display = "none";
    chatbutton.style.display = "none";
    // cancelbutton.style.display = "none";
    videotbutton.style.display = "none";
}

function UIStatusToUnready() {
    // sid = "";
    // inputbox.value = sid;
    startbutton.style.display = "block";
    startbutton.setAttribute("disabled", "disabled");
    // requestbutton.style.display = "block";
    // requestbutton.setAttribute("disabled", "disabled");
    stopbutton.style.display = "none";
    chatbutton.style.display = "none";
    // cancelbutton.style.display = "none";
    videotbutton.style.display = "none";
}

function UIStatusToready() {
    // sid = "";
    // inputbox.value = sid;
    startbutton.style.display = "block";
    startbutton.removeAttribute("disabled");
    // requestbutton.style.display = "block";
    // requestbutton.removeAttribute("disabled");
    stopbutton.style.display = "none";
    chatbutton.style.display = "none";
    // cancelbutton.style.display = "none";
    videotbutton.style.display = "none";
}

function initialize() {
    chrome.storage.local.get(['sid', 'username'], function (result) {
        if (result.sid != undefined) {
            sid = result.sid;
            username = result.username;
            inputbox.value = sid;
            usernamebox.value = username;
            // requestbutton.value = "REQUEST NEW CODE";
            stopbutton.style.display = "none";
            chatbutton.style.display = "none";
            videotbutton.style.display = "none";
            // cancelbutton.style.display = "none";
        }
    });
    sentMsgToContent(STATUSASK);
    sentMsgToContent(STATUSVIDEO);
    sentMsgToContent(STATUSCHAT);
}
initialize();