var video = null;
var chatSentButton = null;
var chatSentInput = null;
video = document.querySelector('video');
var lastMsgUpdateTime;

if (video != null) {
    class Debugger {
        static log(msg) {
            if (debug) {
                console.log(new Date().format('yyyy-MM-dd hh:mm:ss') + ' ' + msg);
            }
        }
    }
    Debugger.log('videojs loaded');
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
    var operationFlag = 0;
    var timer = null;
    var debug = true;

    var operation = null;

    var codelist = [];
    var codeMaxLength = 10;
    var codeMinInterval = 5 * 1000;
    var codeCoolingTime = 3 * 1000;

    // check connection every 30s.
    setInterval(function () {
        isOpen(websocket) ? status = STATUSSYNC : status = STATUSEND;
    }, 1000 * 30);

    Date.prototype.format = function (formatStr) {
        var str = formatStr;
        var Week = ['日', '一', '二', '三', '四', '五', '六'];

        str = str.replace(/yyyy|YYYY/, this.getFullYear());
        str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

        str = str.replace(/MM/, this.getMonth() > 9 ? this.getMonth().toString() : '0' + this.getMonth());
        str = str.replace(/M/g, this.getMonth());

        str = str.replace(/w|W/g, Week[this.getDay()]);

        str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
        str = str.replace(/d|D/g, this.getDate());

        str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
        str = str.replace(/h|H/g, this.getHours());
        str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
        str = str.replace(/m/g, this.getMinutes());

        str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
        str = str.replace(/s|S/g, this.getSeconds());

        return str;
    }

    class SyncHelper {

        static notification(msg) {
            // this.isFullScreen() && this.exitFullscreen();
            swal(msg, {
                buttons: false,
                timer: 3000,
            });
        }

        static addCode(code) {
            codelist.push([code, Date.now()]);
            if (codelist.length > codeMaxLength) {
                codelist.shift();
            }
        }

        static isFrequent() {
            if (codelist.length == 0) return false;
            // Debugger.log(codelist.length);
            // Debugger.log(Date.now() - codelist[0][1] - codeMinInterval);
            return codelist.length == codeMaxLength && (Date.now() - codelist[0][1]) < codeMinInterval;
        }

        static coolDown() {
            setTimeout(
                function () {
                    codelist = [];
                }, codeCoolingTime);
        }

        static codeMessage(code) {
            let ALLCODE = {
                "-1": "CLOSEDCODE",
                "-2": "DISCONNECTCODE",
                "-3": "HELLOCODE",
                "-4": "PLAYCODE",
                "-5": "PAUSECODE"
            };
            if (ALLCODE.hasOwnProperty(code)) {
                return ALLCODE[code];
            } else {
                return "CURRENT TIME";
            }
        }

        static send(code) {
            if (status != STATUSSYNC) {
                if (status == STATUSCONNECT) {
                    SyncHelper.notification("not connected to other partner, please wait and pause the video");
                    Debugger.log(`WAITING FOR THE PARTNER`);
                }
                return;
            }

            if (isOpen(websocket) && operationFlag >= 0) {
                if (this.isFrequent()) {
                    websocket.send(PAUSECODE);
                    video.pause();
                    SyncHelper.notification("the operation is too frequent, please waiting for " + codeCoolingTime / 1000 + "s.");
                    SyncHelper.coolDown();
                    Debugger.log(`WAITING FOR COOLING TIME`);
                    return;
                }
                SyncHelper.addCode(code);
                Debugger.log("send message: " + code + ", " + SyncHelper.codeMessage(code));
                websocket.send(code);
            } else {
                operationFlag++;
            }
        }

        static sendMsg(content) {
            websocket.send("USRMESSAGE-" + content);
            Debugger.log("send message: " + "USRMESSAGE:" + content);
        }

        static isFullScreen() {
            return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
        }

        static exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
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
                    status = STATUSCONNECT;
                }
                video = document.querySelector('video');
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
            SyncHelper.send(PAUSECODE);
            // Debugger.log(`SENT PAUSECODE`);
        })

        video.addEventListener("play", (e) => {
            e.stopPropagation();
            SyncHelper.send(video.currentTime)
            // Debugger.log(`SENT CURRENT TIME`);
            SyncHelper.send(PLAYCODE)
            // Debugger.log(`SENT PLAYCODE`);
        })

        video.onseeking = function () {
            SyncHelper.send(video.currentTime);
            // Debugger.log(`SENT CURRENT TIME`);
            video.pause();
        }

        websocket.onmessage = (msg) => {
            Debugger.log("receive message: " + msg.data + ", " + SyncHelper.codeMessage(msg.data));
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
                    if (!video.paused) {
                        Debugger.log(`RECEIVED PAUSECODE`);
                        operationFlag -= 1;
                        video.pause();
                    }
                    return;
                case PLAYCODE:
                    if (video.paused) {
                        Debugger.log(`RECEIVED PLAYCODE`);
                        operationFlag -= 2;
                        video.play();
                    }
                    return;
                case HELLOCODE:
                    Debugger.log(`RECEIVED HELLOCODE`);
                    SyncHelper.notification("connected to other partner successfully, now you both can enjoy yourselves");
                    status = STATUSSYNC;
                    return;
                default:
                    if (msg.data.substr(0, 10) == "USRMESSAGE") {
                        let usrmessage = msg.data.substr(11);
                        renderMsg(usrmessage, "chatin");
                        Debugger.log(`RECEIVED MSG ${usrmessage}`);
                        if (chatpopup.style.display == "none"){
                            notifyMsg();
                        }
                        return;
                    } else {
                        if (msg.data <= video.duration && msg.data >= 0) {
                            if (Math.abs(msg.data - video.currentTime) > 1) {
                                operationFlag -= 2;
                                video.currentTime = msg.data;
                                Debugger.log(`RECEIVED CURRENT TIME`);
                            }
                        }
                        return;
                    }
            }
        }

        chatSentButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (chatSentInput.value !== "") {
                SyncHelper.sendMsg(chatSentInput.value);
                renderMsg(chatSentInput.value, "chatout");
                chatSentInput.value = "";
            }
        })

        chatSentInput.onkeydown = function (e) {
            if (e.keyCode == 13 && chatSentInput.value !== "") {
                SyncHelper.sendMsg(chatSentInput.value);
                renderMsg(chatSentInput.value, "chatout");
                chatSentInput.value = "";
            }
        }
    }
}

renderChatIcon();

function renderChatIcon() {
    var chatbutton = document.createElement("button");
    chatbutton.setAttribute("id", "chatbutton");
    chatbutton.textContent = "test";
    document.querySelector("body").appendChild(chatbutton);
    chatbutton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
    // load new style
    var chatButtonStyle = document.createElement('style');
    chatButtonStyle.type = 'text/css';
    chatButtonStyle.textContent = `
    #chatbutton {
        position: fixed;
        z-index: 999999;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        background-color: #1cb495;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
        border-width: 0;
        top: 90%;
        left: 90%;
        transition: all 0.2s;
    }
    
    #chatbutton:hover {
        background-color: #1fcaa7;
        transform: scale(1.1);
    }

    #chatbutton > svg{
        padding-top: 10%;
    }

    .bg-primary{
        background-color: #1cb495;
    }

    #chatpopup {
        z-index: 999999;
        position: fixed;
        bottom: 10%;
        right: 10%;
        width: 300px;
        height: 500px;
        border-radius: 1%;
        padding-right: 10px;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
        background-color: white;
        overflow: hidden;
    }

    #chatpopup:hover {
        overflow-y: scroll;
        overflow-y: overlay;
    }

    .putIn {
        width: 280px;
        height: 48px;
        position: sticky;
        padding: 4px;
        background-color: rgba(165, 151, 151, 0.5);
        left: 10px;
        border-radius: 7px;
        bottom: 10px;
        top: 432px;
      }
      .chatpopup-input {
        border: 0;
        height: 34px;
        margin: 3px;
        margin-right: 0;
        transition: border-color 0.2s ease, background-color 0.2s ease;
        background-color: transparent;
        border-radius: 6px;
        border: solid 2px rgba(165, 151, 151, 0.35);
        color: inherit;
        outline: 0;
        text-decoration: none;
        width: 195px;
        padding-left: 5px;
        margin-left: 5px;
      }

      .chatpopup-sent {
        width: 55px;
        margin: 6px;
        transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out;
        background-color: #1cb495;
        border-radius: 6px;
        border: 0;
        color: #ffffff !important;
        cursor: pointer;
        display: inline-block;
        font-size: 12px;
        height: 36px;
        text-align: center;
        text-decoration: none;
        white-space: nowrap;
      }

      .chatpopup-input:hover {
        border: solid 2px #1cb495;
    }

      .putIn button:hover {
        background-color: #1fcaa7;
      }

      .chatlist {
        margin-top: 20px;
        padding: 0 5px 15px 16px;
      }
      .chatlist p.time {
        margin: 0;
        text-align: center;
      }
      .chatlist p.time span {
        padding: 0 18px;
        display: inline-block;
        font-size: 11px;
        color: #fff;
        border-radius: 10px;
        background-color: #dcdcdc;
      }
      .chatlist .chatout,
      .chatlist .chatin {
        margin: 10px 0;
      }
      .chatlist .chatout {
        text-align: right;
      }

      .chatlist .chatout span {
        display: inline-block;
        position: relative;
        padding: 8px;
        /* max-width: calc(100% - 90px); */
        /* min-height: 10%; */
        line-height: 20px;
        font-size: 13px;
        word-break: break-all;
        border-radius: 7px;
        background-color: #1cb495;
        color: #fff;
        text-align: left;
      }
      .chatlist .chatout span:before {
        content: " ";
        position: absolute;
        top: 9px;
        left: 100%;
        border: 6px solid transparent;
        border-left-color: #1cb495;
      }

      .chatlist .chatin span {
        display: inline-block;
        position: relative;
        padding: 8px;
        /* max-width: calc(100% - 90px); */
        /* min-height: 10%; */
        line-height: 20px;
        font-size: 13px;
        word-break: break-all;
        border-radius: 7px;
        text-align: left;
        background-color: #cccac7;
        margin-right: 5px;
      }
      .chatlist .chatin span:before {
        content: " ";
        position: absolute;
        top: 9px;
        right: 100%;
        border: 6px solid transparent;
        border-right-color: #cccac7;
      }
      
    `;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(chatButtonStyle);

    renderChatPopup();
    chatbutton.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleChatUIstate(document.querySelector("#chatpopup").style.display == "none");
    })
}

async function renderChatPopup() {
    //var chatPopupTemp = Template.load("chrome-extension://ocfjeogljngknapodpfhjpdidbddjaik/chatpopup.html");
    var chatPopup = document.createElement("div");
    chatPopup.setAttribute("id", "chatpopup");
    chatPopup.style.display = "none";
    document.querySelector("body").appendChild(chatPopup);

    chatPopup.innerHTML = `
    <!-- message box -->

    <div class="chatlist">
		<p class="time"><span>10:53</span></p>
		<div class="chatin"><!-- 客服 -->
			<span>placeholder白日依山尽</span>
		</div>
		<p class="time"><span>11:01</span></p>
		<div class="chatout"><!-- 询问 -->
			<span>placeholder黄河入海流</span>
        </div>
	</div>

    <div class="putIn">
        <input type="text" class="chatpopup-input">
        <button type="button" class="chatpopup-sent">SENT</button>
    </div>

    `;
    chatSentButton = document.querySelector(".chatpopup-sent");
    chatSentInput = document.querySelector(".chatpopup-input");
    console.log(chatSentButton);
    console.log(chatSentInput);

}

function toggleChatUIstate(state) {
    var chatbutton = document.querySelector("#chatbutton");
    var chatpopup = document.querySelector("#chatpopup");

    if (state) {
        chatbutton.setAttribute("class", "chatbutton show");
        chatbutton.innerHTML = `<svg t="1592209153350" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2139" width="25" height="25"><path d="M925.468404 822.294069 622.19831 512.00614l303.311027-310.331931c34.682917-27.842115 38.299281-75.80243 8.121981-107.216907-30.135344-31.369452-82.733283-34.259268-117.408013-6.463202L512.000512 399.25724 207.776695 87.993077c-34.675754-27.796066-87.272669-24.90625-117.408013 6.463202-30.178323 31.414477-26.560936 79.375815 8.121981 107.216907l303.311027 310.331931L98.531596 822.294069c-34.724873 27.820626-38.341237 75.846432-8.117888 107.195418 30.135344 31.43699 82.72919 34.326806 117.408013 6.485715l304.178791-311.219137 304.177767 311.219137c34.678824 27.841092 87.271646 24.951275 117.408013-6.485715C963.808618 898.140501 960.146205 850.113671 925.468404 822.294069z" p-id="2140" fill="#cac8c7"></path></svg>`
        chatbutton.style.backgroundColor = "#1cb495";
        chatpopup.style.display = "block";
        document.querySelector(".chatlist").lastElementChild.scrollIntoView();
    } else {
        chatpopup.style.display = "none";
        chatbutton.setAttribute("class", "chatbutton");
        chatbutton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
    }
}

function notifyMsg() {
    var chatbutton = document.querySelector("#chatbutton");
    chatbutton.style.backgroundColor = "#e13b3b";
}

function renderMsg(msg, chatio) {
    var msgList = document.querySelector(".chatlist");
    var curTime = new Date().format('hh:mm');
    if (lastMsgUpdateTime != curTime) {
        var chatTime = document.createElement("p");
        chatTime.setAttribute("class", "time");
        chatTime.innerHTML = `<span>${new Date().format('hh:mm')}</span>`;
        msgList.appendChild(chatTime);
        lastMsgUpdateTime = curTime;
    }

    var chatContent = document.createElement("div");
    chatContent.setAttribute("class", chatio);
    chatContent.innerHTML = `<span>${msg}</span>`
    msgList.appendChild(chatContent);
    chatContent.scrollIntoView();
}
