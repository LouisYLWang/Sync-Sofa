const inputbox = document.getElementById("inputbox");
const confirmbutton = document.getElementById('confirmbutton');
const resetbutton = document.getElementById('resetbutton');
const protocol = document.getElementById('protocol');
const debugtoggle = document.getElementById('debugtoggle');
const chattoggle = document.getElementById('chattoggle');
const videotoggle = document.getElementById('videotoggle');
const notificationtoggle = document.getElementById('notificationtoggle');

var systemNotification = false;

function saveOptions() {
    var apihostVal = inputbox.value;
    var protocolVal = protocol.options[protocol.selectedIndex].value;
    chrome.storage.local.set({
        'apihost': apihostVal,
        'protocol': protocolVal
    }, () => {
        notification(`server set to ${protocolVal}://${apihostVal}`);
    });
}

function restoreOptions() {
    inputbox.value = "sync-cn.onns.xyz";
    protocol.value = "https";
    chrome.storage.local.set({
        'apihost': "sync-cn.onns.xyz",
        'protocol': "https"
    }, () => {
        notification("restore to default setting!")
    });
}

function toggleDebugging() {
    var debugFlag = debugtoggle.checked;
    chrome.storage.local.set({
        'debug': debugFlag
    }, () => {
        if (debugFlag == true) {
            notification("Switch to debugging mode!")
        } else {
            notification("Close debugging mode!")
        }
    });
}

function toggleChat() {
    var chatFlag = chattoggle.checked;
    chrome.storage.local.set({
        'chat': chatFlag
    }, () => {
        if (chatFlag == true) {
            notification("Switch on built-in chat!")
        } else {
            notification("Switch off built-in chat!")
        }
    });
}

function toggleVideo() {
    var videoFlag = videotoggle.checked;
    chrome.storage.local.set({
        'video': videoFlag
    }, () => {
        if (videoFlag == true) {
            notification("Switch on built-in video!")
        } else {
            notification("Switch off built-in video!")
        }
    });
}

function toggleNotification() {
    var notificationFlag = notificationtoggle.checked;
    chrome.storage.local.set({
        'notification': notificationFlag
    }, () => {
        if (notificationFlag == true) {
            systemNotification = true;
            notification("notification via system method.")
        } else {
            systemNotification = false;
            notification("notification via sweetalert.")
        }
    });
}

function initialize() {
    chrome.storage.local.get(['apihost', 'protocol', 'debug', 'chat', 'video', 'notification'], result => {
        if (result.apihost != undefined && result.apihost != "") {
            inputbox.value = result.apihost;
        } else {
            inputbox.value = "sync-cn.onns.xyz";
            chrome.storage.local.set({
                'apihost': "sync-cn.onns.xyz"
            }, () => { })
        }

        if (result.protocol != undefined) {
            protocol.value = result.protocol;
        } else {
            protocol.value = "https";
            chrome.storage.local.set({
                'protocol': "https"
            }, () => { })
        }

        if (result.debug != undefined) {
            debugtoggle.checked = result.debug
        } else {
            chrome.storage.local.set({
                'debug': "false"
            }, () => { })
        }

        if (result.chat != undefined) {
            chattoggle.checked = result.chat
        } else {
            chrome.storage.local.set({
                'chat': "false"
            }, () => { })
        }

        if (result.video != undefined) {
            videotoggle.checked = result.video
        } else {
            chrome.storage.local.set({
                'video': "false"
            }, () => { })
        }

        if (result.notification != undefined) {
            notificationtoggle.checked = result.notification
            systemNotification = result.notification;
        } else {
            chrome.storage.local.set({
                'notification': "false"
            }, () => { })
        }
    });
}

function notification(msg) {
    if (systemNotification) {
        chrome.runtime.sendMessage('', {
            type: 'notification',
            options: {
                title: 'Sync Sofa notification',
                message: msg,
                iconUrl: '/icons/icon128_on.png',
                type: 'basic'
            }
        });
    } else {
        swal(msg, {
            buttons: false,
            timer: 3000,
        });
    }
}

initialize();


confirmbutton.addEventListener('click', saveOptions);
resetbutton.addEventListener('click', restoreOptions);

inputbox.addEventListener('click', e => {
    if (inputbox.value !== "") {
        inputbox.value = "";
    }
});

debugtoggle.addEventListener('change', toggleDebugging);
chattoggle.addEventListener('change', toggleChat);
videotoggle.addEventListener('change', toggleVideo);
notificationtoggle.addEventListener('change', toggleNotification);
