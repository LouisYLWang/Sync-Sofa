package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/LouisYLWang/WatchTogether/server/session"
	"github.com/gorilla/websocket"
)

const paramID = "id"

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (ctx *Context) InserConnection(id session.SessionID, conn *websocket.Conn) {
	ctx.SocketStore.Lock.Lock()
	defer ctx.SocketStore.Lock.Unlock()
	ctx.SocketStore.ConnectionsMap[id] = conn
	log.Println("socket connected to session: ", id)

}

func (ctx *Context) RemoveConnection(id session.SessionID, conn *websocket.Conn) {
	ctx.SocketStore.Lock.Lock()
	defer ctx.SocketStore.Lock.Unlock()
	delete(ctx.SocketStore.ConnectionsMap, id)
	log.Println("socket remove connection to session: ", id)
}

func (ctx *Context) WebSocketConnHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	sessionID := session.SessionID(r.URL.Query().Get(paramID))

	if err != nil {
		http.Error(w, "failed to open websocket connection", http.StatusUnauthorized)
		return
	}
	fmt.Printf("open websocket connection to %s \n", sessionID)
	ctx.InserConnection(sessionID, conn)

	go (func(conn *websocket.Conn, id session.SessionID) {
		defer conn.Close()
		defer ctx.RemoveConnection(id, conn)
		for {
			_, p, _ := conn.ReadMessage()
			fmt.Print("client says", string(p))
			conn.WriteMessage(websocket.TextMessage, p)
			partnerID := ctx.SessionStore.SessionMap[id].PartnerID
			partnerConn := ctx.SocketStore.ConnectionsMap[partnerID]
			partnerConn.WriteMessage(websocket.TextMessage, p)
		}
	})(conn, sessionID)
}
