const PAUSECODE = "-5";
const PLAYCODE = "-4";
const HELLOCODE = "-3";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const apihost = "app.ylwang.me"
const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSSYNC = "sync"
const STATUSASK = "ask"

var status = STATUSEND;
var websocket = null;
var flag = true;
var timer = null;
var debug = false;

// check connection every 30s.
setInterval(function () {
    isOpen(websocket) ? status = STATUSSYNC : status = STATUSEND;
}, 1000 * 30);

class Debugger {
    static log(msg) {
        if(debug) {
            console.log(msg);
        }
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        Debugger.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.status === STATUSSTART) {
            Debugger.log(`RECEIVED sessionID ${request.body}`);
            let url = `wss://${apihost}/ws/?id=${request.body}`;
            if (websocket) { websocket.close(); }
            websocket = new WebSocket(url);
            if (request.message && request.message.beginFlag) {
                timer = setInterval(function () {
                    if (isOpen(websocket)) {
                        Debugger.log('sent hello code');
                        websocket.send(HELLOCODE);
                        clearInterval(timer);
                    }
                }, 500);
            }
            var video = document.querySelectorAll('video')[0];
            status = STATUSSYNC;
            handleOnSessions(websocket, video);
        }

        if (request.status === STATUSEND) {
            websocket.send(CLOSEDCODE);
            Debugger.log(`SENT CLOSEDCODE`);
            Debugger.log("socket connection closed");
            websocket.close();
            status = STATUSEND;
        }

        if (request.status == STATUSASK) {
            Debugger.log("ask for status: " + status);
            sendResponse({ "status": STATUSASK, "body": status });
        }

    });

function isOpen(websocket) {
    return websocket !== null && websocket.readyState === websocket.OPEN;
}

function handleOnSessions(websocket, video) {
    video.addEventListener("pause", (e) => {
        e.stopPropagation();
        if (isOpen(websocket) && flag) {
            websocket.send(PAUSECODE)
            Debugger.log(`SENT PAUSECODE`);
            return;
        } else {
            flag = true;
        }
    })

    video.addEventListener("play", (e) => {
        e.stopPropagation();
        if (isOpen(websocket) && flag) {
            websocket.send(video.currentTime)
            Debugger.log(`SENT CURRENT TIME`);
            websocket.send(PLAYCODE)
            Debugger.log(`SENT PLAYCODE`);
            return;
        } else {
            flag = true;
        }
    })

    video.onseeking = function () {
        if (flag) {
            websocket.send(video.currentTime)
            Debugger.log(`SENT CURRENT TIME`);
            video.pause();
            return;
        } else {
            flag = true;
        }
    }

    websocket.onmessage = (msg) => {
        flag = false;
        Debugger.log(msg.data)
        switch (msg.data) {
            case CLOSEDCODE:
                video.pause();
                alert("socket connection closed by other partner");
                Debugger.log("socket connection closed by other partner");
                websocket.close();
                status = STATUSEND;
                return;
            case DISCONNECTCODE:
                video.pause();
                alert("not connected to other partner");
                websocket.close();
                status = STATUSEND;
                return;
            case PAUSECODE:
                Debugger.log(`RECEIVED PAUSECODE`);
                if (!video.paused) {
                    video.pause();
                }
                return;
            case PLAYCODE:
                Debugger.log(`RECEIVED PLAYCODE`);
                if (video.paused) {
                    video.play();
                }
                return;
            case HELLOCODE:
                alert("connected to other partner successfully, now you both can enjoy yourselves");
                return;
            default:
                if (msg.data <= video.duration && msg.data >= 0) {
                    if (Math.abs(msg.data - video.currentTime) > 1) {
                        video.currentTime = msg.data;
                        Debugger.log(`RECEIVED CURRENT TIME`);
                    }
                }
                return;
        }
    }
}
