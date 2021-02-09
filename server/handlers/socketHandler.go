package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/LouisYLWang/Sync-Sofa/server/session"
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

func (ctx *Context) RemoveConnection(sessionID session.SessionID, conn *websocket.Conn) {
	ctx.SocketStore.Lock.Lock()
	defer ctx.SocketStore.Lock.Unlock()
	//defer delete(ctx.SessionStore.SessionMap, GetRoomID(sessionID))
	usrID, roomID := GetSelfIDs(sessionID)
	for i := 0; session.SessionID(i) != usrID && i < ctx.SessionStore.SessionMap[roomID].UsrNum; i++{
		partnerID := session.SessionID(fmt.Sprintf("%v%d", roomID, i))
		partnerConn, exist := ctx.SocketStore.ConnectionsMap[partnerID]
		if exist {
			log.Printf("partner cient %s been force closed\n", sessionID)
			partnerConn.WriteMessage(websocket.TextMessage, []byte("-1"))
		}
		conn.WriteMessage(websocket.TextMessage, []byte("-1"))
		delete(ctx.SocketStore.ConnectionsMap, sessionID)
		log.Println("socket remove connection to session: ", sessionID)
	}
}

func GetSelfIDs(selfID session.SessionID) (session.SessionID, session.SessionID) {
	if len(selfID) != 5 {
		return session.InvalidSessionID, session.InvalidSessionID
	}
	usrID := selfID[len(selfID)-1 : len(selfID)]
	roomID := selfID[0 : len(selfID)-1]
	return usrID, roomID
}

func GetRoomID(selfID session.SessionID) (session.SessionID) {
	return selfID[0 : len(selfID)-1]
}

func (ctx *Context) WebSocketConnHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := session.SessionID(r.URL.Query().Get(paramID))
	if len(sessionID) != 5 {
		http.Error(w, "failed to open websocket connection", http.StatusUnauthorized)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
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
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Printf("forced close by cient %s \n", id)
				break
			}
			log.Printf("client %s operate \n", id)
			//conn.WriteMessage(websocket.TextMessage, p)
			_, roomID := GetSelfIDs(sessionID)
			for i := 0; i < ctx.SessionStore.SessionMap[roomID].UsrNum; i++{
				partnerID := session.SessionID(fmt.Sprintf("%v%d", roomID, i))
				if messageType == websocket.TextMessage {
					partnerConn, exist := ctx.SocketStore.ConnectionsMap[partnerID]
					if !exist {
						log.Printf("partner cient %s been disconnected\n", id)
						conn.WriteMessage(websocket.TextMessage, []byte("-2"))
						break
					}
					partnerConn.WriteMessage(websocket.TextMessage, p)
				} else if messageType == websocket.CloseMessage {
					log.Printf("close message received from cient %s \n", id)
					delete(ctx.SessionStore.SessionMap, GetRoomID(sessionID))
					break
				} else if err != nil {
					log.Printf("error reading message %v \n", err)
					break
				}
			}
		}
	})(conn, sessionID)
}
