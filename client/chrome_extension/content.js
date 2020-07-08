// DEBUG mode or not
var debug = false;

chrome.storage.local.get("debug", result => {
    debug = result.debug;
})

var syncTool = null;

const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSCONNECT = "connect"
const STATUSSYNC = "sync"
const STATUSASK = "ask"
const STATUSUNREADY = "unready"
const STATUSREADY = "ready"

var status = STATUSEND;
var video = null;
// video = document.querySelector('video');
var websocket = null;


// Date format function
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

class Debugger {
    static log(msg, color = '') {
        if (debug) {
            console.log('%c ' + new Date().format('yyyy-MM-dd hh:mm:ss') + ' ' + msg, color);
        }
    }
}

class chat {
    chatButton = document.createElement("button");
    chatPopup = document.createElement("div");
    chatSentButton = null;
    chatSentInput = null;
    chatList = null;
    lastMsgUpdateTime = 0;

    constructor() {

        this.addChatStyle()
        this.renderChatIcon();
        this.renderChatPopup();

        this.chatButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleChatUIstate();
        })
        this.chatSentButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.chatSentInput.value !== "") {
                this.send(this.chatSentInput.value);
            }
        })

        let that = this;
        this.chatSentInput.onkeydown = function (e) {
            if (e.keyCode == 13 && that.chatSentInput.value !== "") {
                that.send(that.chatSentInput.value);
            }
        }

        this.listenDragIcon();
        this.listenDragPopup();
    }

    addChatStyle() {
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
            outline:none;
            cursor: pointer;
            text-align: center;
            -webkit-transform: translate(0px, 0px);
                transform: translate(0px, 0px);
        }
        
        #chatbutton:hover {
            background-color: #1fcaa7;
            transform: scale(1.1);
        }
    
        #chatbutton > svg{
            position: absolute;
            top: 11px;
            left: 11px;
        }
    
        .bg-primary{
            background-color: #1cb495;
        }
    
        #chatpopup {
            z-index: 999998;
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
            width: 54px;
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
            outline:none;
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
            margin-bottom: 10px;
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
        @-webkit-keyframes chat-shake {
            0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 
            10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); }
            20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); }
            30% { -webkit-transform: translate(0px, 2px) rotate(0deg); }
            40% { -webkit-transform: translate(1px, -1px) rotate(1deg); }
            50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); }
            60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); }
            70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); }
            80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); }
            90% { -webkit-transform: translate(2px, 2px) rotate(0deg); }
            100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); }
        }
        .chat-shake {
            -webkit-animation-name: chat-shake;
            -webkit-animation-duration: 0.5s;
            -webkit-transform-origin:50% 50%;
            -webkit-animation-iteration-count: infinite;
        }
        .chat-shake {
            display:inline-block
        }
          
        `;
        document.head.appendChild(chatButtonStyle);
    }
    renderChatIcon() {
        // render chat icon
        var chatButton = this.chatButton;
        chatButton.setAttribute("id", "chatbutton");
        chatButton.setAttribute("class", "draggable");
        chatButton.textContent = "test";
        document.body.appendChild(chatButton);
        chatButton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
    }
    renderChatPopup() {
        // render chat popup
        var chatPopup = this.chatPopup;
        chatPopup.id = "chatpopup";
        chatPopup.setAttribute("class", "draggable");
        chatPopup.style.display = "none";
        document.body.appendChild(chatPopup);

        chatPopup.innerHTML = `
        <!-- message box -->
    
        <div class="chatlist">
            <p class="time"><span>waiting for the partner</span></p>
        </div>
    
        <div class="putIn">
            <input type="text" class="chatpopup-input">
            <button type="button" class="chatpopup-sent">send</button>
        </div>
        `;
        this.chatSentButton = document.querySelector(".chatpopup-sent");
        this.chatSentInput = document.querySelector(".chatpopup-input");
        this.chatList = document.querySelector(".chatlist");
    }

    toggleChatUIstate() {
        var chatButton = this.chatButton;
        var chatPopup = this.chatPopup;

        if (!this.isChatPopup()) {
            chatButton.innerHTML = `<svg t="1593111631184" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27674" width="30" height="30"><path d="M378.965333 512l-272.213333-272.213333a85.333333 85.333333 0 0 1 0-120.746667l12.288-12.373333a85.333333 85.333333 0 0 1 120.746667 0L512 378.965333l272.213333-272.213333a85.333333 85.333333 0 0 1 120.746667 0l12.373333 12.288a85.333333 85.333333 0 0 1 0 120.746667L645.034667 512l272.213333 272.213333a85.333333 85.333333 0 0 1 0 120.746667l-12.288 12.373333a85.333333 85.333333 0 0 1-120.746667 0L512 645.034667l-272.213333 272.213333a85.333333 85.333333 0 0 1-120.746667 0l-12.373333-12.288a85.333333 85.333333 0 0 1 0-120.746667L378.965333 512z" p-id="27675" fill="#cac8c7"></path></svg>`;
            chatButton.style.backgroundColor = "#1cb495";
            chatPopup.style.display = "block";
            this.chatList.lastElementChild.scrollIntoView();
        } else {
            chatPopup.style.display = "none";
            chatButton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
        }
    }

    isChatPopup() {
        if (this.chatPopup.style.display != "none") {
            return true;
        }
        return false;
    }

    receive(message) {
        if (!this.isChatPopup()) {
            this.notification();
        }
        this.renderMessage(message, "chatin");
    }

    send(message) {
        syncTool.send(message, "2");
        this.renderMessage(message, "chatout");
        this.chatSentInput.value = "";
    }
    notification() {
        this.chatButton.style.backgroundColor = "#e13b3b";

        // css animation from https://stackoverflow.com/a/36964181/13182099
        this.chatButton.className += ' chat-shake';
    }

    renderMessage(message, type) {
        message = this.html2Escape(message);
        var chatList = this.chatList;
        var curTime = new Date().format('hh:mm');

        if (this.lastMsgUpdateTime != curTime) {
            var chatTime = document.createElement("p");
            chatTime.setAttribute("class", "time");
            chatTime.innerHTML = `<span>${curTime}</span>`;
            chatList.appendChild(chatTime);
            this.lastMsgUpdateTime = curTime;
        }

        var chatContent = document.createElement("div");
        chatContent.setAttribute("class", type);
        chatContent.innerHTML = `<span>${message}</span>`
        chatList.appendChild(chatContent);
        chatContent.scrollIntoView();
    }

    html2Escape(code) {
        return code.replace(/[<>&"]/g, function (c) {
            return {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;'
            }[c];
        });
    }


    listenDragIcon(){
        interact('.draggable')
        .draggable({
          autoScroll: true,
          listeners: {
            // call this function on every dragmove event
            move: this.dragMoveListener
          }
        })
    }

    dragMoveListener (event) {
        var target = event.target
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)'

        // update the posiion attributes
        target.setAttribute('data-x', x)
        target.setAttribute('data-y', y)
    }
}

var chatHandler = new chat();








var operationFlag = 0;


var operation = null;

var codelist = [];
var codeMaxLength = 10;
var codeMinInterval = 5 * 1000;
var codeCoolingTime = 3 * 1000;


class SyncHelper {
    type = "video"
    CLOSEDCODE = "-1";
    DISCONNECTCODE = "-2";
    HELLOCODE = "-3";
    PLAYCODE = "-4";
    PAUSECODE = "-5";
    WAITINGCODE = "-6";
    ALLCODE = {
        "-1": "CLOSEDCODE",
        "-2": "DISCONNECTCODE",
        "-3": "HELLOCODE",
        "-4": "PLAYCODE",
        "-5": "PAUSECODE",
        "-6": "WAITINGCODE"
    };
    SYSTEMMESSAGE = "1";
    CHATMESSAGE = "2";
    SYNCMESSAGE = "3";
    MESSAGETYPE = {
        "1": "SYSTEMMESSAGE",
        "2": "CHATMESSAGE",
        "3": "SYNCMESSAGE"
    }
    socketLock = false;
    ackFlag = false;
    heartBeatTimer = [null, null, null, null];
    heartBeatTimes = [1, 7, 20, 60];

    VLCTimer = null;
    VLCStatus = "paused";
    VLCTime = 0;
    VLCLength = 0;
    VLCCount = 0;

    constructor(serverCode, option, type = "video") {
        this.type = type;
        var that = this;
        var getURLPromise = new Promise(
            (resolve) => {
                chrome.storage.local.get(['apihost', 'protocol'], result => {
                    var apihost = result.apihost;
                    var protocol = result.protocol;
                    var socketprotocol = (protocol == "http") ? "ws" : "wss";
                    var url = `wss://app.ylwang.me/ws/?id=${serverCode}`;
                    if (apihost != undefined && socketprotocol != undefined) {
                        url = `${socketprotocol}://${apihost}/ws/?id=${serverCode}`;
                    }
                    resolve(url);
                });
            });

        getURLPromise.then((url) => {
            var timer = null;
            Debugger.log(`RECEIVED sessionID ${serverCode}`);

            if (websocket) {
                websocket.close();
            }
            websocket = new WebSocket(url);
            if (option && option.beginFlag) {
                timer = setInterval(function () {
                    if (that.isOpen()) {
                        clearInterval(timer);
                        status = STATUSSYNC;
                        that.send(that.HELLOCODE);
                        SyncHelper.notification("connected to other partner successfully, now you both can enjoy yourselves");
                    }
                }, 500);
            } else {
                SyncHelper.notification(`Room created and room code copied to clipboard`);
                status = STATUSCONNECT;
            }
            that.handleSessions();
            // check connection every 30s.
            setInterval(function () {
                that.isOpen() ? status = STATUSSYNC : status = STATUSEND;
            }, 1000 * 30);
        })
    }

    close() {
        this.send(this.CLOSEDCODE);
        this.clearHeartBeats();
        websocket.close();
        status = STATUSEND;
        switch (this.type) {
            case "video":
                break;
            case "vlc":
                clearInterval(this.VLCTimer);
                break;
            default:
                break;
        }
    }

    handleSessions() {
        var that = this;
        switch (this.type) {
            case "video":
                video = document.querySelector('video');
                video.addEventListener("pause", (e) => {
                    e.stopPropagation();

                    that.sync();
                })

                video.addEventListener("play", (e) => {
                    e.stopPropagation();
                    that.sync();
                })

                video.addEventListener("waiting", (e) => {
                    e.stopPropagation();
                    let buffered = false;
                    let BufferedInvLen = video.buffered.length;
                    var i;
                    for (i = 0; i < BufferedInvLen; i++) {
                        buffered |= (video.buffered.start(i) <= video.currentTime + 5 && video.currentTime + 5 <= video.buffered.end(i));
                    }
                    if (!buffered) {
                        that.send(this.WAITINGCODE);
                        video.addEventListener('canplay', (e) => {
                            e.stopPropagation();
                            video.play();
                        });
                    }
                })
                video.onseeking = function () {
                    // video.pause();
                    that.sync();
                }
                break;
            case "vlc":
                this.handleVLC();
                break;
            default:
                break;
        }

        websocket.onmessage = function (message) {
            that.receive(message.data);
        }
    }

    receive(message) {
        // var that = this;
        message = JSON.parse(message);
        // compatible with older versions.
        if (message.type == undefined) {
            if (message === this.HELLOCODE){
                var el = document.createElement('div');
                el.innerHTML = "Your partner are using an outdated version of Sync Sofa, please remind your partner to update follow the instruction of <a href='https://onns.xyz/sync-sofa/#installation'>our Wiki page</a>";
                SyncHelper.notification(``, 5000, el);
                return;
            } else {
                message = {
                    "type": this.SYSTEMMESSAGE,
                    "content": message + ""
                }
            }
        }
        // end.

        Debugger.log(`RECEIVED MESSAGE: ${JSON.stringify(message.content)}, TYPE: ${this.MESSAGETYPE[message.type]}`, 'color: red;');
        switch (message.type) {
            case this.SYSTEMMESSAGE:
                Debugger.log(`RECEIVED ${this.ALLCODE[message.content]}`);
                switch (message.content) {
                    case this.CLOSEDCODE:
                        this.handleVideoPause();
                        SyncHelper.notification("connection closed by other partner");
                        this.close();
                        break;
                    case this.DISCONNECTCODE:
                        this.handleVideoPause();
                        SyncHelper.notification("not connected to other partner");
                        this.close();
                        break;
                    case this.HELLOCODE:
                        SyncHelper.notification("connected to partner successfully, now you both can enjoy yourselves");
                        status = STATUSSYNC;
                        chatHandler.receive("Hi");
                        break;
                    case this.WAITINGCODE:
                        this.handleVideoPause();
                        // SyncHelper.notification("Other partner is buffering, please wait", 1000);
                        break;
                    default:
                        break;
                }
                break;
            case this.CHATMESSAGE:
                chatHandler.receive(message.content);
                break;
            case this.SYNCMESSAGE:
                this.handleSyncMessage(message.content);
                break;
            default:
                break;
        }
    }

    send(message, type = "1") {
        var data = {
            "type": type,
            "content": message
        };
        if (status != STATUSSYNC) {
            if (status == STATUSCONNECT) {
                SyncHelper.notification("not connected to other partner, please wait and pause the video");
                Debugger.log(`WAITING FOR THE PARTNER`);
            }
            return;
        }
        if (this.socketLock && type == this.SYNCMESSAGE) {
            Debugger.log(`BLOCKED BECAUSE OF THE LOCK`);
            return;
        }
        if (this.isOpen()) {
            // if (this.isFrequent()) {
            //     websocket.send(PAUSECODE);
            //     video.pause();
            //     SyncHelper.notification("the operation is too frequent, please waiting for " + codeCoolingTime / 1000 + "s.");
            //     SyncHelper.coolDown();
            //     Debugger.log(`WAITING FOR COOLING TIME`);
            //     return;
            // }
            // SyncHelper.addCode(code);
            // Debugger.log("send message: " + code + ", " + SyncHelper.codeMessage(code));
            websocket.send(JSON.stringify(data));
            Debugger.log(`SENT MESSAGE: ${JSON.stringify(message)}, TYPE: ${this.MESSAGETYPE[type]}`, 'color: green;');
        }
    }

    sync() {
        var isplay = false;
        var currentTime = 0;
        switch (this.type) {
            case "video":
                isplay = !video.paused;
                currentTime = video.currentTime
                break;
            case "vlc":
                isplay = (this.VLCStatus == "playing");
                currentTime = this.VLCTime;
                break;
            default:
                break;
        }
        this.send({
            "isPlay": isplay,
            "currentTime": currentTime,
            "ack": this.ackFlag
        }, this.SYNCMESSAGE);
    }

    handleVLC() {
        var that = this;
        this.VLCTimer = setInterval(function () {
            SyncHelper.ajax({
                url: "requests/status.xml", //请求地址
                type: "GET", //请求方式
                data: {
                    //   location: "art"
                }, //请求参数
                dataType: "xml", // 返回值类型的设定
                async: true, //是否异步
                success: function (response, xml) {
                    that.VLCCount = 0;
                    let VLCTime = parseInt(xml.getElementsByTagName('time')[0].childNodes[0].nodeValue);
                    that.VLCLength = parseInt(xml.getElementsByTagName('length')[0].childNodes[0].nodeValue);
                    let VLCStatus = xml.getElementsByTagName('state')[0].childNodes[0].nodeValue;
                    let changeFlag = false;
                    if (Math.abs(VLCTime - that.VLCTime) > 2) {
                        that.VLCTime = VLCTime;
                        changeFlag = true;
                    } else {
                        that.VLCTime = VLCTime;
                    }
                    if (VLCStatus != that.VLCStatus) {
                        that.VLCStatus = VLCStatus;
                        changeFlag = true;
                    }
                    if (changeFlag) {
                        that.sync();
                    }
                },
                fail: function (status) {
                    that.VLCCount += 1;
                    if (that.VLCCount >= 5) {
                        that.close();
                    }
                    // alert("Error Code: " + status); // 此处为执行成功后的代码
                }
            });
        }, 1000);
    }

    handleVideoPause() {
        switch (this.type) {
            case "video":
                video.pause();
                break;
            case "vlc":
                if (this.VLCStatus == "playing") {
                    SyncHelper.ajax({
                        url: "requests/status.xml", //请求地址
                        type: "GET", //请求方式
                        data: {
                            "command": "pl_pause"
                        }, //请求参数
                        dataType: "xml", // 返回值类型的设定
                        async: true, //是否异步
                        success: function (response, xml) {
                            // pass
                        },
                        fail: function (status) {
                            // alert("Error Code: " + status); // 此处为执行成功后的代码
                        }
                    });
                }
                break;
            default:
                break;
        }
    }

    handleSyncMessage(content) {
        var that = this;
        this.socketLock = true;

        var changeFlag = false;

        switch (this.type) {
            case "video":
                if (content.currentTime <= video.duration && content.currentTime >= 0 && Math.abs(content.currentTime - video.currentTime) > 3) {
                    if (content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        video.currentTime = content.currentTime;
                        changeFlag = true;
                    }
                }
                if (video.paused == content.isPlay) {
                    if (content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        changeFlag = true;
                        if (content.isPlay) {
                            var playPromise = video.play();

                            if (playPromise !== undefined) {
                                playPromise.then(_ => {
                                    // Automatic playback started!
                                    // Show playing UI.
                                }).catch(error => {
                                    // Auto-play was prevented
                                    // Show paused UI.
                                    // that.sync();
                                });
                            }

                        } else {
                            video.pause();
                        }
                    }
                }
                break;
            case "vlc":
                if (content.currentTime <= this.VLCLength && content.currentTime >= 0 && Math.abs(content.currentTime - this.VLCTime) > 3) {
                    if (content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        SyncHelper.ajax({
                            url: "requests/status.xml", //请求地址
                            type: "GET", //请求方式
                            data: {
                                "command": "seek",
                                "val": content.currentTime / that.VLCLength * 100 + '%'
                            }, //请求参数
                            dataType: "xml", // 返回值类型的设定
                            async: true, //是否异步
                            success: function (response, xml) {
                                // pass
                            },
                            fail: function (status) {
                                // alert("Error Code: " + status); // 此处为执行成功后的代码
                            }
                        });
                        changeFlag = true;
                    }
                }
                if ((this.VLCStatus == "playing") != content.isPlay) {
                    if (content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        changeFlag = true;
                        SyncHelper.ajax({
                            url: "requests/status.xml", //请求地址
                            type: "GET", //请求方式
                            data: {
                                "command": "pl_pause"
                            }, //请求参数
                            dataType: "xml", // 返回值类型的设定
                            async: true, //是否异步
                            success: function (response, xml) {
                                // pass
                            },
                            fail: function (status) {
                                // alert("Error Code: " + status); // 此处为执行成功后的代码
                            }
                        });
                    }
                }
                break;
            default:
                break;
        }

        if (changeFlag) {
            this.clearHeartBeats();
            this.heartBeats();
        } else {
            this.socketLock = false;
        }
    }

    heartBeats() {
        var that = this;
        for (var i = 0; i < this.heartBeatTimes.length - 1; i++) {
            this.heartBeatTimer[i] = setTimeout(
                function () {
                    that.socketLock = false;
                    Debugger.log(`HEARTBEATS`);
                    that.ackFlag = true;
                    that.sync();
                    that.ackFlag = false;
                }, 1000 * this.heartBeatTimes[i]);
        }
        var intervalIndex = this.heartBeatTimes.length - 1;
        this.heartBeatTimer[intervalIndex] = setInterval(
            function () {
                that.socketLock = false;
                Debugger.log(`HEARTBEATS REPEATEDLY`);
                that.ackFlag = true;
                that.sync();
                that.ackFlag = false;
            }, 1000 * this.heartBeatTimes[intervalIndex]);
    }
    clearHeartBeats() {
        for (var i = 0; i < this.heartBeatTimer.length - 1; i++) {
            clearTimeout(this.heartBeatTimer[i]);
        }
        clearInterval(this.heartBeatTimer[this.heartBeatTimes.length - 1]);
    }
    static notification(msg, duration = 3000, content = null) {
        // this.isFullScreen() && this.exitFullscreen();
        if (content != null) {
            swal({
                buttons: false,
                content: content,
                timer: duration,
            })
        } else {
            swal(msg, {
                buttons: false,
                timer: duration,
            });
        }
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
            "-5": "PAUSECODE",
            "-6": "WAITINGCODE"
        };
        if (ALLCODE.hasOwnProperty(code)) {
            return ALLCODE[code];
        } else {
            return "CURRENT TIME";
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

    static ajax(options) {
        /**
         * 传入方式默认为对象
         * 作者：eternalshallow
         * 链接：https://juejin.im/post/5a3229da5188257a3e4eadcf
         * 来源：掘金
         * 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
         * */
        options = options || {};
        /**
         * 默认为GET请求
         * */
        options.type = (options.type || "GET").toUpperCase();
        /**
         * 返回值类型默认为json
         * */
        options.dataType = options.dataType || "json";
        /**
         * 默认为异步请求
         * */
        options.async = options.async || true;
        /**
         * 对需要传入的参数的处理
         * */
        var params = this.getParams(options.data);
        var xhr;
        /**
         * 创建一个 ajax请求
         * W3C标准和IE标准
         */
        if (window.XMLHttpRequest) {
            /**
             * W3C标准
             * */
            xhr = new XMLHttpRequest();
        } else {
            /**
             * IE标准
             * @type {ActiveXObject}
             */
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        };
        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, options.async);
            xhr.send(null);
        } else if (options.type == "POST") {
            /**
             *打开请求
             * */
            xhr.open("POST", options.url, options.async);
            /**
             * POST请求设置请求头
             * */
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            /**
             * 发送请求参数
             */
            xhr.send(params);
        }
    }


    static getParams(data) {
        /**
         * 对象参数的处理
         * @param data
         * @returns {string}
         */
        var arr = [];
        for (var param in data) {
            arr.push(
                encodeURIComponent(param) + "=" + encodeURIComponent(data[param])
            );
        }
        // console.log(arr);
        arr.push(("randomNumber=" + Math.random()).replace("."));
        // console.log(arr);
        return arr.join("&");
    }

    isOpen() {
        return websocket !== null && websocket.readyState === websocket.OPEN;
    }
}


function isVLC() {
    if (window.location.port == "8080") {
        return true;
    }
    return false;
}

var videoTimer = null;

if (!isVLC()) {
    status = STATUSUNREADY;
    videoTimer = setInterval(
        function () {
            video = document.querySelector('video');
            if (video != null) {
                Debugger.log("video is ready");
                clearInterval(videoTimer);
                status = STATUSREADY;
            }
        }, 500);
}




// handle the message from the extension
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        Debugger.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.status === STATUSSTART) {
            if (isVLC()) {
                syncTool = new SyncHelper(request.body, request.message, "vlc");
            } else {
                syncTool = new SyncHelper(request.body, request.message);
            }
        }

        if (request.status === STATUSEND) {
            syncTool.close();
        }

        if (request.status == STATUSASK) {
            Debugger.log("ask for status: " + status);
            sendResponse({ "status": STATUSASK, "body": status });
        }

    }
);