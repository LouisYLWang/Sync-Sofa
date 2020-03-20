import (
	“github.com/gorilla/websocket”
)


var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		//TODO: add r.Origin check
		return true
	},
}

func WebSocketConnHandler(w, http.ResponseWriter, r *http.Request) 