// DEBUG mode or not
var debug = true;
var syncTool = null;

const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSCONNECT = "connect"
const STATUSSYNC = "sync"
const STATUSASK = "ask"

var status = STATUSEND;

var video = null;
video = document.querySelector('video');
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
            transition: all 0.2s;
            outline:none;
            cursor: pointer;
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
        chatButton.textContent = "test";
        document.body.appendChild(chatButton);
        chatButton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
    }
    renderChatPopup() {
        // render chat popup
        var chatPopup = this.chatPopup;
        chatPopup.setAttribute("id", "chatpopup");
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
            chatButton.setAttribute("class", "chatbutton show");
            chatButton.innerHTML = `<svg t="1592209153350" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2139" width="25" height="25"><path d="M925.468404 822.294069 622.19831 512.00614l303.311027-310.331931c34.682917-27.842115 38.299281-75.80243 8.121981-107.216907-30.135344-31.369452-82.733283-34.259268-117.408013-6.463202L512.000512 399.25724 207.776695 87.993077c-34.675754-27.796066-87.272669-24.90625-117.408013 6.463202-30.178323 31.414477-26.560936 79.375815 8.121981 107.216907l303.311027 310.331931L98.531596 822.294069c-34.724873 27.820626-38.341237 75.846432-8.117888 107.195418 30.135344 31.43699 82.72919 34.326806 117.408013 6.485715l304.178791-311.219137 304.177767 311.219137c34.678824 27.841092 87.271646 24.951275 117.408013-6.485715C963.808618 898.140501 960.146205 850.113671 925.468404 822.294069z" p-id="2140" fill="#cac8c7"></path></svg>`
            chatButton.style.backgroundColor = "#1cb495";
            chatPopup.style.display = "block";
            this.chatList.lastElementChild.scrollIntoView();
        } else {
            chatPopup.style.display = "none";
            chatButton.setAttribute("class", "chatbutton");
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
}

var chatHandler = new chat();








var operationFlag = 0;


var operation = null;

var codelist = [];
var codeMaxLength = 10;
var codeMinInterval = 5 * 1000;
var codeCoolingTime = 3 * 1000;


class SyncHelper {
    apihost = "app.ylwang.me"
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
    heartBeatTimer = [null, null, null];
    heartBeatTimes = [2, 7, 20];

    constructor(serverCode, option) {

        var timer = null;
        Debugger.log(`RECEIVED sessionID ${serverCode}`);
        let url = `wss://${this.apihost}/ws/?id=${serverCode}`;
        if (websocket) {
            websocket.close();
        }
        websocket = new WebSocket(url);
        var that = this;
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
    }

    close() {
        this.send(this.CLOSEDCODE);
        websocket.close();
        status = STATUSEND;
    }

    handleSessions() {
        var that = this;

        video.addEventListener("pause", (e) => {
            e.stopPropagation();
            that.sync();
        })

        video.addEventListener("play", (e) => {
            e.stopPropagation();
            that.sync();
        })

        video.addEventListener("waiting", (e) =>{
            e.stopPropagation();
            let buffered = false;
            let BufferedInvLen = video.buffered.length;
            var i;
            for (i = 0; i < BufferedInvLen; i++){
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

        websocket.onmessage = function (message) {
            that.receive(message.data);
        }
    }

    receive(message) {
        // var that = this;
        message = JSON.parse(message);

        // compatible with older versions.
        if (message.type == undefined) {
            message = {
                "type": this.SYSTEMMESSAGE,
                "content": message + ""
            }
        }
        // end.

        Debugger.log(`RECEIVED MESSAGE: ${JSON.stringify(message.content)}, TYPE: ${this.MESSAGETYPE[message.type]}`, 'color: red;');
        switch (message.type) {
            case this.SYSTEMMESSAGE:
                Debugger.log(`RECEIVED ${this.ALLCODE[message.content]}`);
                switch (message.content) {
                    case this.CLOSEDCODE:
                        video.pause();
                        SyncHelper.notification("socket connection closed by other partner");
                        websocket.close();
                        status = STATUSEND;
                        break;
                    case this.DISCONNECTCODE:
                        video.pause();
                        SyncHelper.notification("not connected to other partner");
                        websocket.close();
                        status = STATUSEND;
                        break;
                    case this.HELLOCODE:
                        SyncHelper.notification("connected to other partner successfully, now you both can enjoy yourselves");
                        status = STATUSSYNC;
                        chatHandler.receive("Hi");
                        break;
                    case this.WAITINGCODE:
                        video.pause();
                        SyncHelper.notification("Other partner is buffering, please wait");
                        break;
                    default:
                        break;
                }
                break;
            case this.CHATMESSAGE:
                chatHandler.receive(message.content);
                break;
            case this.SYNCMESSAGE:
                this.socketLock = true;

                var changeFlag = false;
                if (message.content.currentTime <= video.duration && message.content.currentTime >= 0 && Math.abs(message.content.currentTime - video.currentTime) > 5) {
                    if (message.content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        video.currentTime = message.content.currentTime;
                        changeFlag = true;
                    }
                }
                if (video.paused == message.content.isPlay) {
                    if (message.content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        changeFlag = true;
                        if (message.content.isPlay) {
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
                if (changeFlag) {
                    this.clearHeartBeats();
                    this.heartBeats();
                } else {
                    this.socketLock = false;
                }
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
        this.send({
            "isPlay": !video.paused,
            "currentTime": video.currentTime,
            "ack": this.ackFlag
        }, this.SYNCMESSAGE);
    }

    heartBeats() {
        var that = this;
        for (var i = 0; i < this.heartBeatTimes.length; i++) {
            this.heartBeatTimer[i] = setTimeout(
                function () {
                    that.socketLock = false;
                    Debugger.log(`HEARTBEATS`);
                    that.ackFlag = true;
                    that.sync();
                    that.ackFlag = false;
                }, 1000 * this.heartBeatTimes[i]);
        }
    }
    clearHeartBeats() {
        for (var i = 0; i < this.heartBeatTimer.length; i++) {
            clearTimeout(this.heartBeatTimer[i]);
        }
    }
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

    isOpen() {
        return websocket !== null && websocket.readyState === websocket.OPEN;
    }
}







// handle the message from the extension
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        Debugger.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.status === STATUSSTART) {
            syncTool = new SyncHelper(request.body, request.message);
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