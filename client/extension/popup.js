const requestbutton = document.getElementById("requestbutton")
const copybutton = document.getElementById("copybutton")
const startbutton = document.getElementById("startbutton")
const testbutton = document.getElementById("testbutton")
const testbutton2 = document.getElementById("testbutton2")
const stopbutton = document.getElementById("stopbutton")
const inputbox = document.getElementById("inputbox");
var hostdiv = document.getElementById("hostdiv");
var guestdiv = document.getElementById("guestdiv");

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

requestbutton.addEventListener("click", e =>{
  e.preventDefault();
  handleCreateHostSession(e)
})

copybutton.addEventListener("click", e =>{
    e.preventDefault();
    copyToClipboard(e)
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
        sentMsgToContent(sessionPair.selfID);
        if (copybutton.style.display === "none") {
          copybutton.style.display = "block";
        } 
      })
}

function copyToClipboard(e){
    e.preventDefault();
    inputbox.select();
    document.execCommand("copy");
    alert("copied the text: " + inputbox.value + " to clipboard");  
    if (guestdiv.style.display === "block") {
      guestdiv.style.display = "none";
    } 
}

function sentMsgToContent(body){
  chrome.tabs.query(params,(tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, 
      {"status":"start", "body":body});
    console.log(`SENT sessionID ${body}`);
  });  
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
        sentMsgToContent(sessionPair.selfID)
    })
  }
