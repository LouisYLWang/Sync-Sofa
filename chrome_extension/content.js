// DEBUG mode or not
var debug = false;

chrome.storage.local.get("debug", result => {
    debug = result.debug;
})

var syncTool = null;

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
const iconList = {
    "ready": "/icons/icon128_red.png",
    "unready": "/icons/icon128_on.png",
    "end": "/icons/icon128_red.png",
    "sync": "/icons/icon128_green.png",
    "connect": "/icons/icon128_yellow.png"
}
var status = STATUSEND;
var video = null;
// video = document.querySelector('video');
var websocket = null;
var url = "";
var systemNotification = false;
var videoHandler = null;
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
    statuschat = false;

    constructor() {

        this.addChatStyle()
        this.renderChatIcon();
        this.renderChatPopup();

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
        chrome.storage.local.set({
            'statuschat': false
        });
        this.listenDrag();
    }

    addChatStyle() {
        // load new style
        var chatButtonStyle = document.createElement('style');
        chatButtonStyle.type = 'text/css';
        chatButtonStyle.textContent = chrome.runtime.getURL("/assets/css/chat.css");
        document.head.appendChild(chatButtonStyle);
    }
    renderChatIcon() {
        // render chat icon
        var chatButton = this.chatButton;
        chatButton.setAttribute("id", "chatbutton");
        chatButton.setAttribute("class", "chatbutton");
        chatButton.textContent = "test";
        document.body.appendChild(chatButton);
        chatButton.innerHTML = `<svg t="1592196731793" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11334" width="30" height="30"><path d="M146.6 782C146.6 782 146.6 782 146.6 782c3.6 6 5.6 12.8 5.6 20.4L128 928l112.4-44.2c5.4-2.2 11.2-3.4 17.4-3.4 5.6 0 11 1 16 2.8 0 0 0.2 0 0.4 0 0.8 0.4 1.6 0.6 2.4 1 35.6 14.6 74.8 22.8 115.8 22.8 92.6 0 175.2-41 229.6-105.2-28.2 7.2-57.8 11.4-88.2 11.4-191.8 0-347.4-150-347.4-335 0-23.6 2.6-46.4 7.4-68.6C133.8 461.8 96 537.2 96 621.2c0 56.8 17.2 110.4 47 155C144.2 777.8 145.4 780 146.6 782z" p-id="11335" fill="#cac8c7"></path><path d="M580.6 96c-167.4 0-307.2 114.4-340 266.4-4.8 22.2-7.4 45-7.4 68.6 0 185 155.4 335 347.4 335 30.6 0 60-4.2 88.2-11.4 16.2-4.2 32.2-9 47.6-15.2 1-0.4 1.8-0.8 2.8-1.2 0.2 0 0.4 0 0.4-0.2 5.8-2.2 12.2-3.4 18.6-3.4 7.2 0 14 1.4 20.2 4l137.2 51.6-34-147.6c0-8.8 2.4-17.2 6.6-24.4 0 0 0 0 0 0 1.2-2.2 2.8-4.2 4.2-6.2 34.8-52.2 55-114.4 55-181C928 246 772.6 96 580.6 96z" p-id="11336" fill="#cac8c7"></path></svg>`;
    }
    renderChatPopup() {
        // render chat popup
        var chatPopup = this.chatPopup;
        chatPopup.id = "chatpopup";
        chatPopup.setAttribute("class", "chatpopup");
        chatPopup.style.display = "none";
        document.body.appendChild(chatPopup);
        var chatPopupStyle = `
            .putIn {
                width: fit-content;
                height: 48px;
                position: sticky;
                padding: 4px;
                background-color: whitesmoke;
                left: 5px;
                border-radius: 7px;
                bottom: 4px;
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
                padding: 13px;
            }
            .chatlist p.time {
                margin: 0;
                text-align: center;
            }
            .chatlist p.time span {
                padding: 3px 18px;
                display: inline-block;
                font-size: 11px;
                color: #fff;
                border-radius: 10px;
                background-color: #dcdcdc;
                margin-bottom: 10px;
                white-space: initial;
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
                white-space: initial;
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
                white-space: initial;
            }
            .chatlist .chatin span:before {
                content: " ";
                position: absolute;
                top: 9px;
                right: 100%;
                border: 6px solid transparent;
                border-right-color: #cccac7;
            }
        `

        chatPopup.attachShadow({ mode: 'open' }).innerHTML = `
        <!-- message box -->
        <style>
            ${chatPopupStyle}
        </style>
        <div class="chatlist">
            <p class="time"><span>waiting for the partner</span></p>
        </div>
    
        <div class="putIn">
            <input type="text" class="chatpopup-input">
            <button type="button" class="chatpopup-sent">send</button>
        </div>
        `;
        this.chatSentButton = chatPopup.shadowRoot.querySelector(".chatpopup-sent");
        this.chatSentInput = chatPopup.shadowRoot.querySelector(".chatpopup-input");
        this.chatList = chatPopup.shadowRoot.querySelector(".chatlist");
    }

    toggleChatUIstate() {
        var chatButton = this.chatButton;
        var chatPopup = this.chatPopup;
        this.chatButton.style.top = "90%";
        this.chatButton.style.left = "90%";
        if (this.chatButton.classList.contains('chat-shake')) {
            this.chatButton.classList.remove('chat-shake');
        }

        if (!this.isChatPopup()) {
            chatButton.innerHTML = `<svg t="1593111631184" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27674" width="30" height="30"><path d="M378.965333 512l-272.213333-272.213333a85.333333 85.333333 0 0 1 0-120.746667l12.288-12.373333a85.333333 85.333333 0 0 1 120.746667 0L512 378.965333l272.213333-272.213333a85.333333 85.333333 0 0 1 120.746667 0l12.373333 12.288a85.333333 85.333333 0 0 1 0 120.746667L645.034667 512l272.213333 272.213333a85.333333 85.333333 0 0 1 0 120.746667l-12.288 12.373333a85.333333 85.333333 0 0 1-120.746667 0L512 645.034667l-272.213333 272.213333a85.333333 85.333333 0 0 1-120.746667 0l-12.373333-12.288a85.333333 85.333333 0 0 1 0-120.746667L378.965333 512z" p-id="27675" fill="#cac8c7"></path></svg>`;
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
        var curLeftPos = this.chatButton.getBoundingClientRect().left.toString();
        var curTopPos = this.chatButton.getBoundingClientRect().top.toString();
        // css animation from https://stackoverflow.com/a/36964181/13182099
        if (!this.chatButton.classList.contains("video-shake")) {
            this.chatButton.classList.add("chat-shake");
            this.chatButton.style.top = curTopPos + "px";
            this.chatButton.style.left = curLeftPos + "px";
        }
    }


    renderTime(message) {
        var chatTime = document.createElement("p");
        chatTime.setAttribute("class", "time");
        chatTime.innerHTML = `<span>${message}</span>`;
        this.chatList.appendChild(chatTime);
    }

    renderMessage(message, type) {
        message = this.html2Escape(message);
        var chatList = this.chatList;
        var curTime = new Date().format('hh:mm');

        if (this.lastMsgUpdateTime != curTime) {
            this.renderTime(curTime);
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


    listenDrag() {
        interact('.chatbutton')
            .draggable({
                autoScroll: false,
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //       restriction: 'parent',
                //       endOnly: true
                //     })
                // ],
                cursorChecker() {
                    // don't set a cursor for drag actions
                    return null
                },
                listeners: {
                    // call this function on every dragmove event
                    move: this.dragMoveListener
                }
            })
            .on("tap", (e) => {
                this.toggleChatUIstate();
                e.preventDefault();
                e.currentTarget.classList.toggle('showpopup');
            })

        interact('.chatpopup')
            .draggable({
                autoScroll: false,
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //       restriction: 'parent',
                //       endOnly: true
                //     })
                // ],
                cursorChecker() {
                    // don't set a cursor for drag actions
                    return null
                },
                listeners: {
                    // call this function on every dragmove event
                    move: this.dragMoveListener
                }
            })
    }

    dragMoveListener(event) {
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

    toggleChatDisplay() {
        chrome.storage.local.get(['chat'], result => {
            if (result.chat) {
                this.chatButton.style.display = "block";
                this.chatButton.style.left = "90%";
                this.chatButton.style.top = "90%";
            } else {
                this.chatButton.style.display = "none";
                this.chatPopup.style.display = "none";
                this.statuschat = false;
            }
        });
    }

    popConnectedSubmsg() {
        this.renderTime("Connected to peer, now you can chat with each other. ", "time");
        this.renderTime("Please do not share sensitive information such as bank account or password at here.", "time");
        this.notification();
    }
}

var chatHandler = new chat();

class videoCaller {
    peerConnection = null;
    videoControl = null;
    videoControlCollapseBtn = null
    videoControlDailHangBtn = null
    localVideo = null;
    remoteVideo = null;
    videoButton = document.createElement("button");
    videoPopup = document.createElement("div");
    statusvideo = false;
    localStream = null;
    stream = null;

    localVideoDisplayState = true;
    callState = false;

    constructor() {

        this.addVideoStyle()
        this.renderVideoIcon();
        this.renderVideoPopup();

        this.videoControlCollapseBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.localVideoDisplayState) {
                this.localVideo.style.display = "none";
                this.videoControlCollapseBtn.textContent = "view self"
                this.localVideoDisplayState = false;
            } else {
                this.localVideo.style.display = "block";
                this.videoControlCollapseBtn.textContent = "hide self"
                this.localVideoDisplayState = true;
            }
        })

        this.videoControlDailHangBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleCallHangUp();
        })

        chrome.storage.local.set({
            'statusvideo': false
        });
        this.listenDrag();
    }

    initRTCPeerConnection() {
        var configuration = {
            // free servers from https://gist.github.com/yetithefoot/7592580
            iceServers: [
                { urls: 'stun:stun.noblogs.org:3478' },
                { urls: 'stun:stun01.sipphone.com' },
                { urls: 'stun:stun.ekiga.net' },
                { urls: 'stun:stun.fwdnet.net' },
                { urls: 'stun:stun.ideasip.com' },
                { urls: 'stun:stun.iptel.org' },
                { urls: 'stun:stun.rixtelecom.se' },
                { urls: 'stun:stun.schlund.de' },
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:stunserver.org' },
                { urls: 'stun:stun.softjoys.com' },
                { urls: 'stun:stun.voiparound.com' },
                { urls: 'stun:stun.voipbuster.com' },
                { urls: 'stun:stun.voipstunt.com' },
                { urls: 'stun:stun.voxgratia.org' },
                { urls: 'stun:stun.xten.com' },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=udp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                },
                {
                    url: 'turn:192.158.29.39:3478?transport=tcp',
                    credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                    username: '28224511:1379330808'
                }
            ]
        };
        this.peerConnection = new RTCPeerConnection(configuration)
    }

    setUpPeerConnection() {
        // Setup ice handling
        this.peerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                syncTool.send({
                    event: "candidate",
                    data: event.candidate
                }, "4")
            }
        }
    }

    createOffer() {
        Debugger.log(`WEBRTC: created Offer`, 'color: blue;');
        const offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };
        this.peerConnection.createOffer(offerOptions).then(offer => {
            syncTool.send({
                event: "offer",
                data: offer
            }, "4")
            this.peerConnection.setLocalDescription(offer);
        })
    }

    handleOffer(offer) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // create and send an answer to an offer
        this.peerConnection.createAnswer().then((answer) => {
            this.peerConnection.setLocalDescription(answer);
            syncTool.send({
                event: "answer",
                data: answer
            }, "4")
        }
        )
    };

    handleCandidate(candidate) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    handleAnswer(answer) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        Debugger.log(`WEBRTC: connection established successfully`, 'color: blue;');
    };

    sendMessage() {
        this.dataChannel.send(input.value);
        input.value = "";
    }

    hangup() {
        if (this.peerConnection != null) {
            this.peerConnection.close();
        }
        this.localVideo.srcObject = null;
        this.remoteVideo.srcObject = null;
        this.toggleVideoUIstate("hangup");
        if (this.stream != null) {
            const videoTracks = this.stream.getVideoTracks();
            videoTracks.forEach(videoTrack => {
                videoTrack.stop();
                this.stream.removeTrack(videoTrack);
            });
        }
        this.videoControlDailHangBtn.textContent = "dial";
        this.videoControl.style.display = "block";
        this.callState = false;
    }

    call() {
        this.callState = true;
        this.videoControl.style.display = "none";
        this.videoControlDailHangBtn.textContent = "hang up";
        this.videoControlMousemovementListener();
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then(stream => {
            this.stream = stream;
            this.localVideo.srcObject = stream;
            stream.getTracks().forEach((track) => {
                Debugger.log(`WEBRTC: Sent local stream`, 'color: blue;');
                this.peerConnection.addTrack(track, stream);
            })
            this.createOffer()
        }).catch(e => {
            switch (e.name) {
                case "NotFoundError":
                    SyncHelper.notification("Unable to open your call because no camera and/or microphone were found.");
                    break;
                case "SecurityError":
                case "PermissionDeniedError":
                    // Do nothing; this is the same as the user canceling the call.
                    break;
                default:
                    SyncHelper.notification("Error opening your camera and/or microphone");
                    Debugger.log("Error opening your camera and/or microphone: " + e.message);
                    break;
            }
        });
    }

    // Video UI
    addVideoStyle() {
        // load new style
        var videoButtonStyle = document.createElement('style');
        videoButtonStyle.type = 'text/css';
        videoButtonStyle.textContent = chrome.runtime.getURL("/assets/css/vidcall.css");
        document.head.appendChild(videoButtonStyle);
    }

    renderVideoIcon() {
        // render video icon
        var videoButton = this.videoButton;
        videoButton.setAttribute("id", "videobutton");
        videoButton.setAttribute("class", "videobutton");
        videoButton.textContent = "test";
        document.body.parentNode.appendChild(videoButton);
        videoButton.innerHTML = `<svg t="1603522170062" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1299" xmlns:xlink="http://www.w3.org/1999/xlink" width="30"><defs><style type="text/css"></style></defs><path d="M782.378667 106.666667a42.666667 42.666667 0 0 1 42.666666 42.666666v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667h-213.333334a42.666667 42.666667 0 0 1-42.666666-42.666667v-170.666667a42.666667 42.666667 0 0 1 42.666666-42.666666h213.333334z m149.333333 34.56a21.333333 21.333333 0 0 1 21.333333 21.333333v144.213333a21.333333 21.333333 0 0 1-30.890666 19.114667L825.173333 277.333333v-85.333333l97.024-48.554667a21.333333 21.333333 0 0 1 9.557334-2.261333zM732.032 748.245333a42.666667 42.666667 0 0 1 17.877333 53.845334c-13.568 36.181333-27.264 61.184-41.130666 75.050666a149.290667 149.290667 0 0 1-145.450667 38.357334 637.056 637.056 0 0 1-322.176-174.122667 637.013333 637.013333 0 0 1-174.08-322.218667 149.248 149.248 0 0 1 38.314667-145.408c13.866667-13.866667 38.869333-27.562667 75.008-41.088a42.666667 42.666667 0 0 1 53.802666 17.834667l99.84 172.928c11.349333 19.626667 5.546667 37.76-13.397333 56.746667-16.469333 14.762667-29.866667 25.216-40.192 31.402666 21.12 39.168 48.256 75.989333 81.365333 109.098667 33.152 33.152 69.973333 60.288 109.226667 81.450667 4.522667-8.746667 15.018667-22.058667 31.488-40.064 16-16 33.194667-23.978667 51.968-15.957334l4.608 2.304 172.928 99.84z" p-id="1300" fill="#cac8c7"></path></svg>`;
    }

    renderVideoPopup() {
        // render video popup
        var videoPopup = this.videoPopup;
        videoPopup.id = "videopopup";
        videoPopup.setAttribute("class", "videopopup");
        videoPopup.style.display = "none";
        document.body.parentNode.appendChild(videoPopup);
        var videoPopupStyle = `
            #videoControl {
                width: 100%;
                height: 48px;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.2);
                background-color: whitesmoke;
                border-radius: 7px;
                -webkit-transform: translate(0px, 0px);
                transform: translate(0px, 0px);
                display: block;
                transition: max-height 0.2s ease-in-out;
            }
            
            /* .videoControlButton {
                transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
            } */
            
            #videoControl-dialhang {
                width: 46.5%;
                margin: 6px 0 6px 6px;
                background-color: #e14334;
                transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
            
            #videoControl-dialhang:hover {
                background-color: #e85d51;
            }
            
            #videoControl-collapse {
                width: 46.5%;
                margin: 6px 0 6px 6px;
                background-color: #1cb495;
                transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out;
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
            
            #videoControl-collapse:hover {
                background-color: #1fcaa7;
            }

            video#localVideo {
                height: 225px;
                width: 100%;
                border-radius: 3%;
                transition: max-height 0.2s ease-in-out;
                background-color: aliceblue;
                transform: rotateY(180deg);
                position: relative;
                margin-bottom: 5px;
            }
            
            video#remoteVideo {
                height: 225px;
                width: 100%;
                border-radius: 3%;
                background-color: aliceblue;
                position: relative;
                margin-bottom: 5px;
            }
        `

        videoPopup.attachShadow({ mode: 'open' }).innerHTML = `
            <style>
                ${videoPopupStyle}
            </style>
            <video id="remoteVideo" playsinline autoplay poster=${chrome.runtime.getURL("/images/no_video_remote.png")}></video>
            <video id="localVideo" playsinline autoplay poster=${chrome.runtime.getURL("/images/no_video_local.png")} muted></video>
            <div id="videoControl">
                <button type="button" id="videoControl-dialhang" class="videoControlButton">dial</button>
                <button type="button" id="videoControl-collapse" class="videoControlButton">hide self</button>
            </div>
        `;

        this.videoControl = videoPopup.shadowRoot.querySelector("#videoControl");
        this.videoControlCollapseBtn = videoPopup.shadowRoot.querySelector("#videoControl-collapse");
        this.videoControlDailHangBtn = videoPopup.shadowRoot.querySelector("#videoControl-dialhang");
        this.localVideo = videoPopup.shadowRoot.getElementById('localVideo');
        this.remoteVideo = videoPopup.shadowRoot.getElementById('remoteVideo');
    }

    toggleCallHangUp() {
        if (this.callState) {
            syncTool.send(syncTool.HANGUPCODE, "5");
            this.hangup();
            //this.videoControlDailHangBtn.style.backgroundColor = "#e14334";
        } else {
            this.initRTCPeerConnection();
            syncTool.send(syncTool.DAILCODE, "5");
            this.setUpPeerConnection();
            this.call();
            this.peerConnection.ontrack = event => {
                Debugger.log(`WEBRTC: Ontracked remote video steam`, 'color: blue;');
                this.remoteVideo.srcObject = event.streams[0];
            };
            //this.videoControlDailHangBtn.style.backgroundColor = "#e14334";
        }
        // this.videoButton.classList.toggle('showpopup');
        this.videoButton.className = 'videobutton';
    }

    async toggleVideoUIstate(type = "change") {
        var videoButton = this.videoButton;
        var videoPopup = this.videoPopup;
        this.videoButton.style.top = "80%";
        this.videoButton.style.left = "90%";
        if (this.videoButton.classList.contains('video-shake')) {
            this.videoButton.classList.remove('video-shake');
            this.videoButton.classList.toggle('showpopup');
            // this.videoButton.className = 'videobutton';
            this.call();
        }


        switch (type) {
            case "hangup":
                videoPopup.style.display = "none";
                videoButton.innerHTML = `<svg t="1603522170062" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1299" xmlns:xlink="http://www.w3.org/1999/xlink" width="30"><defs><style type="text/css"></style></defs><path d="M782.378667 106.666667a42.666667 42.666667 0 0 1 42.666666 42.666666v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667h-213.333334a42.666667 42.666667 0 0 1-42.666666-42.666667v-170.666667a42.666667 42.666667 0 0 1 42.666666-42.666666h213.333334z m149.333333 34.56a21.333333 21.333333 0 0 1 21.333333 21.333333v144.213333a21.333333 21.333333 0 0 1-30.890666 19.114667L825.173333 277.333333v-85.333333l97.024-48.554667a21.333333 21.333333 0 0 1 9.557334-2.261333zM732.032 748.245333a42.666667 42.666667 0 0 1 17.877333 53.845334c-13.568 36.181333-27.264 61.184-41.130666 75.050666a149.290667 149.290667 0 0 1-145.450667 38.357334 637.056 637.056 0 0 1-322.176-174.122667 637.013333 637.013333 0 0 1-174.08-322.218667 149.248 149.248 0 0 1 38.314667-145.408c13.866667-13.866667 38.869333-27.562667 75.008-41.088a42.666667 42.666667 0 0 1 53.802666 17.834667l99.84 172.928c11.349333 19.626667 5.546667 37.76-13.397333 56.746667-16.469333 14.762667-29.866667 25.216-40.192 31.402666 21.12 39.168 48.256 75.989333 81.365333 109.098667 33.152 33.152 69.973333 60.288 109.226667 81.450667 4.522667-8.746667 15.018667-22.058667 31.488-40.064 16-16 33.194667-23.978667 51.968-15.957334l4.608 2.304 172.928 99.84z" p-id="1300" fill="#cac8c7"></path></svg>`;
                break;
            default:
                if (!this.isVideoPopup()) {
                    videoButton.innerHTML = `<svg t="1593111631184" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="27674" width="30" height="30"><path d="M378.965333 512l-272.213333-272.213333a85.333333 85.333333 0 0 1 0-120.746667l12.288-12.373333a85.333333 85.333333 0 0 1 120.746667 0L512 378.965333l272.213333-272.213333a85.333333 85.333333 0 0 1 120.746667 0l12.373333 12.288a85.333333 85.333333 0 0 1 0 120.746667L645.034667 512l272.213333 272.213333a85.333333 85.333333 0 0 1 0 120.746667l-12.288 12.373333a85.333333 85.333333 0 0 1-120.746667 0L512 645.034667l-272.213333 272.213333a85.333333 85.333333 0 0 1-120.746667 0l-12.373333-12.288a85.333333 85.333333 0 0 1 0-120.746667L378.965333 512z" p-id="27675" fill="#cac8c7"></path></svg>`;
                    videoPopup.style.display = "flex";
                } else {
                    videoPopup.style.display = "none";
                    videoButton.innerHTML = `<svg t="1603522170062" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1299" xmlns:xlink="http://www.w3.org/1999/xlink" width="30"><defs><style type="text/css"></style></defs><path d="M782.378667 106.666667a42.666667 42.666667 0 0 1 42.666666 42.666666v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667h-213.333334a42.666667 42.666667 0 0 1-42.666666-42.666667v-170.666667a42.666667 42.666667 0 0 1 42.666666-42.666666h213.333334z m149.333333 34.56a21.333333 21.333333 0 0 1 21.333333 21.333333v144.213333a21.333333 21.333333 0 0 1-30.890666 19.114667L825.173333 277.333333v-85.333333l97.024-48.554667a21.333333 21.333333 0 0 1 9.557334-2.261333zM732.032 748.245333a42.666667 42.666667 0 0 1 17.877333 53.845334c-13.568 36.181333-27.264 61.184-41.130666 75.050666a149.290667 149.290667 0 0 1-145.450667 38.357334 637.056 637.056 0 0 1-322.176-174.122667 637.013333 637.013333 0 0 1-174.08-322.218667 149.248 149.248 0 0 1 38.314667-145.408c13.866667-13.866667 38.869333-27.562667 75.008-41.088a42.666667 42.666667 0 0 1 53.802666 17.834667l99.84 172.928c11.349333 19.626667 5.546667 37.76-13.397333 56.746667-16.469333 14.762667-29.866667 25.216-40.192 31.402666 21.12 39.168 48.256 75.989333 81.365333 109.098667 33.152 33.152 69.973333 60.288 109.226667 81.450667 4.522667-8.746667 15.018667-22.058667 31.488-40.064 16-16 33.194667-23.978667 51.968-15.957334l4.608 2.304 172.928 99.84z" p-id="1300" fill="#cac8c7"></path></svg>`;
                }
                break;
        }
    }

    isVideoPopup() {
        if (this.videoPopup.style.display != "none") {
            return true;
        }
        return false;
    }

    notification() {
        var curLeftPos = this.videoButton.getBoundingClientRect().left.toString();
        var curTopPos = this.videoButton.getBoundingClientRect().top.toString();
        // css animation from https://stackoverflow.com/a/36964181/13182099
        if (!this.videoButton.classList.contains("video-shake")) {
            this.videoButton.classList.toggle("video-shake");
            this.videoButton.style.top = curTopPos + "px";
            this.videoButton.style.left = curLeftPos + "px";
        }
    }

    videoControlMousemovementListener() {
        this.videoPopup.addEventListener("mouseover", (e) => {
            e.stopPropagation();
            this.videoControl.style.display = "block";
        })

        this.videoPopup.addEventListener("mouseout", (e) => {
            e.stopPropagation();
            this.videoControl.style.display = "none";
        })
    }

    listenDrag() {
        interact('.videobutton')
            .draggable({
                autoScroll: false,
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //       restriction: 'parent',
                //       endOnly: true
                //     })
                // ],
                cursorChecker() {
                    // don't set a cursor for drag actions
                    return null
                },
                listeners: {
                    // call this function on every dragmove event
                    move: this.dragMoveListener
                }
            })
            .on("tap", (e) => {
                this.toggleVideoUIstate();
                e.preventDefault();
                e.currentTarget.classList.toggle('showpopup');
            })

        interact('.videopopup')
            .draggable({
                autoScroll: false,
                // modifiers: [
                //     interact.modifiers.restrictRect({
                //       restriction: 'parent',
                //       endOnly: true
                //     })
                // ],
                cursorChecker() {
                    // don't set a cursor for drag actions
                    return null
                },
                listeners: {
                    // call this function on every dragmove event
                    move: this.dragMoveListener
                }
            })
    }

    dragMoveListener(event) {
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

    toggleVideoDisplay() {
        chrome.storage.local.get(['video'], result => {
            if (result.video) {
                this.videoButton.style.display = "block";
                this.videoButton.style.left = "90%";
                this.videoButton.style.top = "80%";
            } else {
                this.videoButton.style.display = "none";
                this.videoPopup.style.display = "none";
                this.statusvideo = false;
            }
        });
    }
}
videoHandler = new videoCaller();

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
    DAILCODE = "-7";
    HANGUPCODE = "-8";
    ALLCODE = {
        "-1": "CLOSEDCODE",
        "-2": "DISCONNECTCODE",
        "-3": "HELLOCODE",
        "-4": "PLAYCODE",
        "-5": "PAUSECODE",
        "-6": "WAITINGCODE",
        "-7": "DAILCODE",
        "-8": "HANGUPCODE"
    };
    SystemMessageType = 1;
    OperateMessageType = 2;
    SYNCMESSAGE = "3";
    SIGNALINGMESSAGE = "4";
    CALLMESSAGE = "5";
    MESSAGETYPE = {
        1: "SYSTEMMESSAGE",
        2: "PALY"
        // "3": "CHATMESSAGE",
        // "3": "SYNCMESSAGE",
        // "4": "SIGNALINGMESSAGE",
        // "5": "CALLMESSAGE"
    }
    socketLock = false;
    ackFlag = false;
    heartBeatTimer = [null, null, null, null];
    heartBeatTimes = [1, 7, 20, 30];
    VLCTimer = null;
    VLCStatus = "paused";
    VLCTime = 0;
    VLCRate = 1;
    VLCLength = 0;
    VLCCount = 0;
    socketTimer = null;
    speed = 1;
    rateTimer = null;
    videoHandler = null;

    constructor(type = "video") {
        this.type = type;
        var that = this;
        var getURLPromise = new Promise(
            (resolve) => {
                chrome.storage.local.get(['apihost', 'protocol', 'notification', 'sid', 'username'], result => {
                    var apihost = result.apihost;
                    var sid = result.sid;
                    if (sid == undefined) {
                        SyncHelper.notification(`RoomID error`);
                        return;
                    }
                    var username = result.username;
                    if (username == undefined) {
                        SyncHelper.notification(`username error`);
                        return;
                    }
                    var protocol = result.protocol;
                    systemNotification = result.notification;
                    var socketprotocol = (protocol == "http") ? "ws" : "wss";
                    url = `wss://sync-cn.onns.xyz/v2/ws/?id=${sid}&name=${username}`;
                    if (apihost != undefined && socketprotocol != undefined) {
                        url = `${socketprotocol}://${apihost}/v2/ws/?id=${sid}&name=${username}`;
                    }
                    resolve(url);
                });
            });

        getURLPromise.then((url) => {
            var timer = null;
            Debugger.log(`RECEIVED sessionID ${url}`);

            if (websocket) {
                websocket.close();
            }
            websocket = new WebSocket(url);
            SyncHelper.notification(`Room created and room code copied to clipboard`);
            status = STATUSSYNC;
            SyncHelper.updateIcon();
            that.handleSessions();
            that.checkSocket();
            that.checkSpeed();
        })
    }
    handleEvent(e) {
        // console.log(e);
        switch (e.type) {
            case "waiting":
                // e.stopPropagation();
                let buffered = false;
                let BufferedInvLen = video.buffered.length;
                var i;
                for (i = 0; i < BufferedInvLen; i++) {
                    buffered |= (video.buffered.start(i) <= video.currentTime + 5 && video.currentTime + 5 <= video.buffered.end(i));
                }
                if (!buffered) {
                    this.send(this.WAITINGCODE);
                }
                break;
            case "canplay":
                // e.stopPropagation();
                video.play();
                break;
            default:
                // e.stopPropagation();
                this.sync();
                break;
        }
    }

    close() {
        this.send(this.CLOSEDCODE);
        this.clearHeartBeats();
        websocket.close();
        clearInterval(this.socketTimer);
        clearInterval(this.rateTimer);
        status = STATUSEND;
        SyncHelper.updateIcon();
        switch (this.type) {
            case "video":
                video.removeEventListener("pause", this, true);
                video.removeEventListener("play", this, true);
                video.removeEventListener("seeking", this, true);
                video.removeEventListener("waiting", this, true);
                video.removeEventListener("canplay", this, true);
                break;
            case "vlc":
                clearInterval(this.VLCTimer);
                break;
            default:
                break;
        }
        if (videoHandler != null) {
            videoHandler.hangup();
        }
    }

    handleSessions() {
        var that = this;
        switch (this.type) {
            case "video":
                video = document.querySelector('video');
                video.addEventListener("pause", this, true);
                video.addEventListener("play", this, true);
                video.addEventListener("seeking", this, true);
                video.addEventListener("waiting", this, true);
                video.addEventListener("canplay", this, true);
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
            if (message === this.HELLOCODE) {
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

        Debugger.log(`RECEIVED MESSAGE: ${JSON.stringify(message.data)}, TYPE: ${this.MESSAGETYPE[message.type]}`, 'color: red;');
        switch (message.type) {
            case this.SYSTEMMESSAGE:
                Debugger.log(`RECEIVED ${this.ALLCODE[message.data]}`);
                switch (message.data) {
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
            case this.OperateMessageType:
                this.handleSyncMessage(JSON.parse(message.data));
                break;

            case this.SIGNALINGMESSAGE:
                Debugger.log(`RECEIVED SIGNALING MESSAGE: ${this.ALLCODE[message.content]}`);
                var data = message.content.data;
                switch (message.content.event) {
                    case "offer":
                        if (videoHandler.peerConnection == null || videoHandler.peerConnection.signalingState == "closed") {
                            videoHandler.initRTCPeerConnection();
                            videoHandler.peerConnection.ontrack = event => {
                                Debugger.log(`WEBRTC: Ontracked remote video steam`, 'color: blue;');
                                videoHandler.remoteVideo.srcObject = event.streams[0];
                            };
                            if (videoHandler.isVideoPopup()) {
                                videoHandler.call();
                            }
                        }
                        videoHandler.handleOffer(data);
                        break;
                    case "answer":
                        videoHandler.handleAnswer(data);
                        break;
                    // when a remote peer sends an ice candidate to us
                    case "candidate":
                        videoHandler.handleCandidate(data);
                        break;
                    default:
                        break;
                }
                break;

            case this.CALLMESSAGE:
                Debugger.log(`RECEIVED CALL MESSAGE`);
                switch (message.content) {
                    case this.DAILCODE:
                        if (!videoHandler.isVideoPopup()) {
                            videoHandler.notification();
                        }
                        break;

                    case this.HANGUPCODE:
                        videoHandler.hangup();
                        SyncHelper.notification("video call hang up by peer!");
                        break;
                }

            default:
                break;
        }
    }

    send(message, type = 1) {
        var data = {
            "version": "2",
            "type": type,
            "data": message
        };
        Debugger.log(`${JSON.stringify(message)}, TYPE: ${this.MESSAGETYPE[type]}`);
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
        var rate = 1;
        switch (this.type) {
            case "video":
                isplay = !video.paused;
                currentTime = video.currentTime;
                rate = video.playbackRate;
                break;
            case "vlc":
                isplay = (this.VLCStatus == "playing");
                currentTime = this.VLCTime;
                rate = this.VLCRate;
                break;
            default:
                break;
        }
        this.send(JSON.stringify({
            "isPlay": isplay,
            "currentTime": currentTime,
            "rate": rate,
            "ack": this.ackFlag,
            "timestamp": (new Date()).getTime()
        }), this.OperateMessageType);
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
                    let VLCRate = parseFloat(xml.getElementsByTagName('rate')[0].childNodes[0].nodeValue);
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
                    if (VLCRate != that.VLCRate) {
                        that.VLCRate = VLCRate;
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

        if (content.timestamp != undefined) {
            content.currentTime += ((new Date()).getTime() - content.timestamp) / 1000;
        }

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
                if (content.rate != undefined && video.playbackRate != content.rate) {
                    if (content.ack) {
                        this.socketLock = false;
                        this.clearHeartBeats();
                        this.sync();
                    } else {
                        changeFlag = true;
                        video.playbackRate = content.rate;
                        this.speed = content.rate;
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
                if (content.rate != undefined && this.VLCRate != content.rate) {
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
                                "command": "rate",
                                "val": parseFloat(content.rate)
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
        arr.push(("randomNumber=" + Math.random()).replace("."));
        return arr.join("&");
    }

    checkSocket() {
        // check connection every 5s.
        var that = this;
        that.socketTimer = setInterval(function () {
            if (that.isOpen()) {
                // status = STATUSSYNC;
                // SyncHelper.updateIcon();
            } else {
                SyncHelper.notification(`Socket disconnected, unknown reason, try to reconnect.`);
                websocket = new WebSocket(url);
                websocket.onmessage = function (message) {
                    that.receive(message.data);
                }
            }
        }, 1000 * 5);
    }

    reconnect() {

    }
    checkSpeed() {
        // check connection every 1s.
        var that = this;
        that.rateTimer = setInterval(function () {
            switch (that.type) {
                case "video":
                    if (that.speed != video.playbackRate) {
                        that.speed = video.playbackRate;
                        that.sync();
                    }
                    break;
                case "vlc":
                    break;
                default:
                    break;
            }
        }, 1000 * 1);
    }

    isOpen() {
        return websocket !== null && websocket.readyState === websocket.OPEN;
    }

    static updateIcon() {
        chrome.runtime.sendMessage('', {
            type: 'changeIcon',
            path: iconList[status]
        });
    }
}


function isVLC() {
    if (window.location.port == "8080" || window.location.port == "9891") {
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
                SyncHelper.updateIcon();
            }
        }, 500);
}

document.addEventListener('fullscreenchange', (event) => {
    // document.fullscreenElement will point to the element that
    // is in fullscreen mode if there is one. If there isn't one,
    // the value of the property is null.
    if (document.fullscreenElement) {
        var fullscreenElement = document.fullscreenElement;
        fullscreenElement.appendChild(this.chatHandler.chatButton);
        fullscreenElement.appendChild(this.chatHandler.chatPopup);
        fullscreenElement.appendChild(this.videoHandler.videoButton);
        fullscreenElement.appendChild(this.videoHandler.videoPopup);
        console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
    } else {
        console.log('Leaving full-screen mode.');
    }
});



// handle the message from the extension
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        Debugger.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.status === STATUSSTART) {
            if (isVLC()) {
                syncTool = new SyncHelper("vlc");
            } else {
                syncTool = new SyncHelper();
            }
            if (syncTool != null) {
                sendResponse({ "body": syncTool.status });
            }
        }

        if (request.status === STATUSEND) {
            syncTool.close();
        }

        if (request.status === STATUSMESSAGE) {
            SyncHelper.notification(request.body);
        }

        if (request.status === STATUSCHAT) {
            chatHandler.toggleChatDisplay();
            sendResponse({ "body": syncTool == undefined ? null : syncTool.status });
        }

        if (request.status === STATUSVIDEO) {
            videoHandler.toggleVideoDisplay();
            sendResponse({ "body": syncTool == undefined ? null : syncTool.status });
        }

        if (request.status == STATUSASK) {
            Debugger.log("ask for status: " + status);
            sendResponse({ "status": STATUSASK, "body": status });
        }

    }
);