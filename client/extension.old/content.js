const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const apihost = "app.ylwang.me"

chrome.runtime.onMessage.addListener((msg)=> {
  if (msg.status === "start"){
    console.log(`RECEIVED sessionID ${msg.body}`);
    let url = `wss://${apihost}/ws/?id=${msg.body}`
    handleOnSessions(url)
  }
});

video = document.querySelectorAll('video')[0]  

function isOpen(websocket) { return websocket.readyState === websocket.OPEN }

function handleOnSessions(url){
  var websocket = new WebSocket(url);
  video.addEventListener("pause", ()=>{
    if (isOpen(websocket)){
      websocket.send(PAUSECODE)
      console.log(`SENT PAUSECODE`);
    };
  })

  video.addEventListener("play", ()=>{
    if (isOpen(websocket)){
      websocket.send(PLAYCODE)
      console.log(`SENT PLAYCODE`);
    };
  })

  chrome.runtime.onMessage.addListener((msg)=> {
    if (msg.status === "end"){
      video.pause();
      websocket.close();
      console.log("socket connection closed");
      return;
    }
  });

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
        video.pause();   
        console.log(`RECEIVED PAUSECODE`);
        return;
      case PLAYCODE:
        video.play();
        console.log(`RECEIVED PLAYCODE`);
        return;
    }
  }
}
