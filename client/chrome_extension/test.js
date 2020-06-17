var audio = null;
audio = document.querySelector('audio');
if (audio != null) {
    audio.onabort = function () {
        this.setAttribute("songid", VUE_APP.$store.state.playNow.aId);
    }

    setInterval(function () {
        if (audio.getAttribute("songid") != null && audio.getAttribute("songid") != VUE_APP.$store.state.playNow.aId) {
            // console.log(audio.getAttribute("songid"));
            VUE_APP.$store.dispatch("updatePlayNow", VUE_APP.$store.state.allSongs[audio.getAttribute("songid")]);
        }
    }, 500);
}