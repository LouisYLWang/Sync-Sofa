const apihost = "app.ylwang.me"

const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const HELLOCODE = "-3";
const PLAYCODE = "-4";
const PAUSECODE = "-5";

const STATUSSTART = "start"
const STATUSEND = "end"

const OPPAUSE = "pause"
const OPPLAY = "play"
const OPSYNC = "synctime"

//connect to server
const STATUSCONNECT = "connect"
//connect to partner
const STATUSSYNC = "sync"
const STATUSASK = "ask"

var status = STATUSEND;
var websocket = null;
var flag = true;
var timer = null;
var debug = true;
var video = null;
var operation = null;

// check connection every 30s.
setInterval(function () {
    isOpen(websocket) ? status = STATUSSYNC : status = STATUSEND;
}, 1000 * 30);

Date.prototype.format = function(formatStr)   
{   
    var str = formatStr;   
    var Week = ['日','一','二','三','四','五','六'];  
  
    str=str.replace(/yyyy|YYYY/,this.getFullYear());   
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));   
  
    str=str.replace(/MM/,this.getMonth()>9?this.getMonth().toString():'0' + this.getMonth());   
    str=str.replace(/M/g,this.getMonth());   
  
    str=str.replace(/w|W/g,Week[this.getDay()]);   
  
    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());   
    str=str.replace(/d|D/g,this.getDate());   
  
    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());   
    str=str.replace(/h|H/g,this.getHours());   
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());   
    str=str.replace(/m/g,this.getMinutes());   
  
    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());   
    str=str.replace(/s|S/g,this.getSeconds());   
  
    return str;   
}   

class Debugger {
    static log(msg) {
        if(debug) {
            console.log(new Date().format('yyyy-MM-dd hh:mm:ss'));
            console.log(msg);
        }
    }
}

class SyncHelper {
    static notification(msg) {
        swal(msg, {
            buttons: false,
            timer: 3000,
          });
    }

    static send() {
        if (status != STATUSSYNC){
            return;
        }

        if (isOpen(websocket) && flag) {
            switch (operation) {
                case OPPAUSE:
                    websocket.send(PAUSECODE)
                    Debugger.log(`SENT PAUSECODE`);
                    return;
                    
                case OPPLAY:
                    websocket.send(video.currentTime)
                    Debugger.log(`SENT CURRENT TIME`);
                    websocket.send(PLAYCODE)
                    Debugger.log(`SENT PLAYCODE`);
                    return;
                
                case OPSYNC:
                    websocket.send(video.currentTime)
                    Debugger.log(`SENT CURRENT TIME`);
                    return;

                default:
                    return;
            };
        } else {
            flag = true;
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
                        clearInterval(timer);
                        Debugger.log('sent hello code');
                        websocket.send(HELLOCODE);
                        SyncHelper.notification("connected to other partner successfully, now you both can enjoy yourselves");
                        status = STATUSSYNC;
                    }
                }, 500);
            } else {
                SyncHelper.notification(`Room created and room code copied to clipboard`);
            }
            video = document.querySelector('video');
            status = status == STATUSSYNC ? STATUSSYNC: STATUSCONNECT
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
        operation = OPPAUSE;
        SyncHelper.send();
    })

    video.addEventListener("play", (e) => {
        e.stopPropagation();
        operation = OPPLAY;
        SyncHelper.send();
    })

    video.onseeking = function () {
        operation = OPSYNC;
        SyncHelper.send();
    }

    websocket.onmessage = (msg) => {
        flag = false;
        Debugger.log(msg.data)
        switch (msg.data) {
            case CLOSEDCODE:
                video.pause();
                SyncHelper.notification("socket connection closed by other partner");
                Debugger.log("socket connection closed by other partner");
                websocket.close();
                status = STATUSEND;
                return;
            case DISCONNECTCODE:
                video.pause();
                SyncHelper.notification("not connected to other partner");
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
                Debugger.log(`RECEIVED HELLOCODE`);
                flag = true;
                SyncHelper.notification("connected to other partner successfully, now you both can enjoy yourselves");
                status = STATUSSYNC;
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
