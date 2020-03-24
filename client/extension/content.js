const PAUSECODE = "1";
const PLAYCODE = "2";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";

video = document.querySelectorAll('video')[0]  

if(video !== null){
  video.addEventListener("pause", e=>{
    chrome.runtime.sendMessage(PAUSECODE)
  //alert("pause message sent");
  })

  video.addEventListener("play", e=>{
    chrome.runtime.sendMessage(PLAYCODE)
    //alert("play message sent");
  })

  chrome.runtime.onMessage.addListener((status)=> {
    console.log(`RECEIVED ${status}`);
    if (status === PAUSECODE){
      video.pause();
    }else if (status === PLAYCODE){
      console.log(status);
      video.play();
    }
  });
}

