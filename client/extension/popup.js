const requestbutton = document.getElementById("requestbutton")
const copybutton = document.getElementById("copybutton")
const startbutton = document.getElementById("startbutton")
const testbutton = document.getElementById("testbutton")
const testbutton2 = document.getElementById("testbutton2")
const stopbutton = document.getElementById("stopbutton")
const inputbox = document.getElementById("inputbox");

const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const apihost = "localhost:3000"

const params = {
  active: true,
  currentWindow: true
}
var websocket;

copybutton.addEventListener("click", e =>{
    e.preventDefault();
    copyToClipboard(e)
})

requestbutton.addEventListener("click", e =>{
    e.preventDefault();
    handleCreateHostSession(e)
})

startbutton.addEventListener("click", e =>{
    e.preventDefault();
    handleBeginSessions(e)
})

function handleCreateHostSession(e){
    e.preventDefault();
    let url = `http://${apihost}/v1/session`
    fetch(url,{
        method: 'GET',          
        }).then(res => {
            if (res.status < 300) {
                return res.json();
            }
            return res.text();
        }).then(data => {
        console.log(data);
        sessionPair = JSON.parse(JSON.stringify(data));
        if(sessionPair != null){
            inputbox.value = sessionPair.selfID;
        }
    })
}

function copyToClipboard(e){
    e.preventDefault();
    let url = `ws://${apihost}/ws/?id=${inputbox.value}`
    inputbox.select();
    document.execCommand("copy");
    alert("copied the text: " + inputbox.value + " to clipboard");     
    handleOnSessions(e, url)
}

function handleBeginSessions(e){
    e.preventDefault();
    let url = `http://${apihost}/v1/session/?id=${inputbox.value}`
    fetch(url,{
        method: 'GET',          
        }).then(res => {
            if (res.status < 300) {
                return res.json();
            }
            return res.text();
        }).then(data => {
        console.log(data);
        sessionPair = JSON.parse(JSON.stringify(data));
        if(sessionPair != null){
            inputbox.value = sessionPair.selfID;
        }
        let url = `ws://${apihost}/ws/?id=${sessionPair.selfID}`
        handleOnSessions(e, url)
    })
}

function handleOnSessions(e, url){
  var websocket = new WebSocket(url);
        websocket.onmessage = (msg) => {
            console.log(`RECEIVED ${msg.data}`);
            if(msg.data == CLOSEDCODE){
                alert("socket connection closed by other partner");
                console.log("socket connection closed by other partner");
                return
            } else if(msg.data == DISCONNECTCODE){
                alert("not connected to other partner");
                return
            } else {
              chrome.tabs.query(params,(tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, msg.data);
              });
            }
        }

  stopbutton.addEventListener("click", e =>{
          e.preventDefault();
          function isOpen(websocket) { return websocket.readyState === websocket.OPEN }
          websocket.close();
          return
  })     

  testbutton.addEventListener("click", ev =>{
    ev.preventDefault();
    function isOpen(websocket) { return websocket.readyState === websocket.OPEN }
    if (isOpen(websocket)){
        console.log(`SENDING PAUSE`);
        websocket.send(PAUSECODE);
    }
  })

  testbutton2.addEventListener("click", ev =>{
    ev.preventDefault();
    function isOpen(websocket) { return websocket.readyState === websocket.OPEN }
    if (isOpen(websocket)){
        console.log(`SENDING PAUSE`);
        websocket.send(PLAYCODE);
    }
  })

  chrome.runtime.onMessage.addListener((status)=> {
    function isOpen(websocket) { return websocket.readyState === websocket.OPEN }
    if (isOpen(websocket)){
        console.log(status);
        websocket.send(status);
    }
  });
}
