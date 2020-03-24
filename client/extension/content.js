const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";

video = document.querySelectorAll('video')[0]  

video.addEventListener("pause", e=>{
  chrome.runtime.sendMessage(PAUSECODE)
});

video.addEventListener("play", e=>{
  chrome.runtime.sendMessage(PLAYCODE)
});

chrome.runtime.onMessage.addListener((status)=> {
  console.log(`RECEIVED ${status}`);
  if (status == PAUSECODE){
    video.pause();
  } else if (status == PLAYCODE){
    video.play();
  }
});

