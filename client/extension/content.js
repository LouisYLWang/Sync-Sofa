const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const apihost = "localhost:3000"

chrome.runtime.onMessage.addListener((msg)=> {
  if (msg.status === "start"){
    console.log(`RECEIVED sessionID ${msg.body}`);
    let url = `ws://${apihost}/ws/?id=${msg.body}`
    handleOnSessions(url)
  }
});

video = document.querySelectorAll('video')[0]  

function isOpen(websocket) { return websocket.readyState === websocket.OPEN }

function handleOnSessions(url){
  var websocket = new WebSocket(url);
  websocket.onmessage = (msg) => {
      switch (msg.data) {
        case CLOSEDCODE:
          alert("socket connection closed by other partner");
          console.log("socket connection closed by other partner");
          return;
        case DISCONNECTCODE:
          alert("not connected to other partner");
          return
        case PAUSECODE:      
          console.log(`RECEIVED PAUSECODE`);
          video.pause();
        case PLAYCODE:
          console.log(`RECEIVED PLAYCODE`);
          video.play();
      }
  }

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
}
