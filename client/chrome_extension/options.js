const inputbox = document.getElementById("inputbox");
const confirmbutton = document.getElementById('confirmbutton');
const resetbutton = document.getElementById('resetbutton');
const protocol = document.getElementById('protocol');
const debugtoggle = document.getElementById('debugtoggle');


function saveOptions() {
    var apihostVal = inputbox.value;
    var protocolVal = protocol.options[protocol.selectedIndex].value;
    chrome.storage.local.set({
        'apihost': apihostVal,
        'protocol': protocolVal
    }, () => {
        alert(`server set to ${protocolVal}://${apihostVal}`);
    });
}

function restoreOptions() {
    chrome.storage.local.set({
        'apihost': "app.ylwang.me",
        'protocol': "https"
    }, () => {
        alert("restore to default setting!")
    });
}

function toggleDebugging() {
    var debugFlag = debugtoggle.checked;
    chrome.storage.local.set({
        'debug': debugFlag
    }, () => {
        if (debugFlag == true) {
            alert("Switch to debugging mode!")
        } else {
            alert("Close debugging mode!")
        }
    });
}

function initialize() {
    chrome.storage.local.get(['apihost', 'protocol'], result => {
        if (result.apihost != undefined) {
            inputbox.value = result.apihost;
        } else {
            chrome.storage.local.set({
                'apihost': "app.ylwang.me"
            }, () => { })
        }

        if (result.protocol != undefined) {
            protocol.value = result.protocol;
        } else {
            chrome.storage.local.set({
                'protocol': "https"
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
