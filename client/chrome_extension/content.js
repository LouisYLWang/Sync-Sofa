const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const apihost = "localhost:3000";
const STATUSSTART = "start";
const STATUSEND = "end";
const STATUSSYNC = "sync";

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.status === STATUSSTART) {
    console.log(`RECEIVED sessionID ${msg.body}`);
    let url = `ws://${apihost}/ws/?id=${msg.body}`;
    var websocket = new WebSocket(url);
    var video = document.querySelectorAll("video")[0];
    handleOnSessions(websocket, video);
  }
});

function isOpen(websocket) {
  return websocket.readyState === websocket.OPEN;
}

function handleOnSessions(websocket, video) {
  video.addEventListener("pause", (e) => {
    e.stopPropagation();
    if (isOpen(websocket)) {
      websocket.send(PAUSECODE);
      console.log(`SENT PAUSECODE`);
      return;
    }
  });

  video.addEventListener("play", (e) => {
    e.stopPropagation();
    if (isOpen(websocket)) {
      websocket.send(video.currentTime);
      console.log(`SENT CURRENT TIME`);
      websocket.send(PLAYCODE);
      console.log(`SENT PLAYCODE`);
      return;
    }
  });

  video.onseeking = function () {
    websocket.send(video.currentTime);
    console.log(`SENT CURRENT TIME`);
    return;
  };

  websocket.onmessage = (msg) => {
    switch (msg.data) {
      case CLOSEDCODE:
        video.pause();
        alert("socket connection closed by other partner");
        console.log("socket connection closed by other partner");
        websocket.close();
        return;
      case DISCONNECTCODE:
        video.pause();
        alert("not connected to other partner");
        websocket.close();
        return;
      case PAUSECODE:
        console.log(`RECEIVED PAUSECODE`);
        if (!video.paused) {
          setTimeout(function () {
            video.pause();
          }, 500);
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
  };
}
