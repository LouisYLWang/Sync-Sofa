const inputbox = document.getElementById("inputbox");
const confirmbutton = document.getElementById('confirmbutton');
const resetbutton = document.getElementById('resetbutton');
const protocol = document.getElementById('protocol');
const debugtoggle = document.getElementById('debugtoggle');
const chattoggle = document.getElementById('chattoggle');


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
    inputbox.value = "app.ylwang.me";
    protocol.value = "https";
    chrome.storage.local.set({
        'apihost': "app.ylwang.me",
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

function initialize() {
    chrome.storage.local.get(['apihost', 'protocol', 'debug', 'chat'], result => {
        if (result.apihost != undefined && result.apihost != "") {
            inputbox.value = result.apihost;
        } else {
            inputbox.value = "app.ylwang.me";
            chrome.storage.local.set({
                'apihost': "app.ylwang.me"
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
    });
}

function notification(msg) {
    swal(msg, {
        buttons: false,
        timer: 3000,
    });
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
