const PAUSECODE = "1";
const PLAYCODE = "2";
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

// check connection every 30s.
setInterval(function () {
    isOpen(websocket) ? status = STATUSSYNC : status = STATUSEND;
}, 1000 * 30);


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.status === STATUSSTART) {
            console.log(`RECEIVED sessionID ${request.body}`);
            let url = `wss://${apihost}/ws/?id=${request.body}`;
            if (websocket) { websocket.close(); }
            websocket = new WebSocket(url);
            var video = document.querySelectorAll('video')[0];
            status = STATUSSYNC;
            handleOnSessions(websocket, video);
        }

        if (request.status === STATUSEND) {
            websocket.send(CLOSEDCODE);
            console.log(`SENT CLOSEDCODE`);
            console.log("socket connection closed");
            websocket.close();
            status = STATUSEND;
        }

        if (request.status == STATUSASK) {
            console.log("ask for status: " + status);
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
            console.log(`SENT PAUSECODE`);
            return;
        } else {
            flag = true;
        }
    })

    video.addEventListener("play", (e) => {
        e.stopPropagation();
        if (isOpen(websocket) && flag) {
            websocket.send(video.currentTime)
            console.log(`SENT CURRENT TIME`);
            websocket.send(PLAYCODE)
            console.log(`SENT PLAYCODE`);
            return;
        } else {
            flag = true;
        }
    })

    video.onseeking = function () {
        if (flag) {
            websocket.send(video.currentTime)
            console.log(`SENT CURRENT TIME`);
            video.pause();
            return;
        } else {
            flag = true;
        }
    }

    websocket.onmessage = (msg) => {
        flag = false;
        switch (msg.data) {
            case CLOSEDCODE:
                video.pause();
                alert("socket connection closed by other partner");
                console.log("socket connection closed by other partner");
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
                console.log(`RECEIVED PAUSECODE`);
                if (!video.paused) {
                    video.pause();
                }
                return;
            case PLAYCODE:
                console.log(`RECEIVED PLAYCODE`);
                if (video.paused) {
                    video.play();
                }
                return;
            default:
                if (msg.data <= video.duration && msg.data >= 0) {
                    if (Math.abs(msg.data - video.currentTime) > 1) {
                        video.currentTime = msg.data;
                        console.log(`RECEIVED CURRENT TIME`);
                    }
                }
                return;
        }
    }
}
