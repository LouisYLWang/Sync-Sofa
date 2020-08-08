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
	partnerID := GetPartnerID(sessionID)
	partnerConn, exist := ctx.SocketStore.ConnectionsMap[partnerID]
	if exist {
		log.Printf("partner cient %s been force closed\n", sessionID)
		partnerConn.WriteMessage(websocket.TextMessage, []byte("-1"))
	}
	conn.WriteMessage(websocket.TextMessage, []byte("-1"))
	delete(ctx.SocketStore.ConnectionsMap, sessionID)
	log.Println("socket remove connection to session: ", sessionID)
}

func GetPartnerID(selfID session.SessionID) session.SessionID {
	usrID := selfID[len(selfID)-1 : len(selfID)]
	pairID := selfID[0 : len(selfID)-1]
	var partnerID session.SessionID

	if usrID == "0" {
		partnerID = pairID + "1"
	} else if usrID == "1" {
		partnerID = pairID + "0"
	} else {
		log.Printf("error parsing the partnerID\n")
		return session.InvalidSessionID
	}
	return partnerID
}

func GetPairID(selfID session.SessionID) session.SessionID {
	return selfID[0 : len(selfID)-1]
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
		defer delete(ctx.SessionStore.SessionMap, GetPairID(sessionID))

		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Printf("forced close by cient %s \n", id)
				break
			}
			log.Printf("client %s operate \n", id)
			//conn.WriteMessage(websocket.TextMessage, p)
			partnerID := GetPartnerID(id)
			if partnerID == session.InvalidSessionID {
				break
			}

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
				delete(ctx.SessionStore.SessionMap, GetPairID(sessionID))
				break
			} else if err != nil {
				log.Printf("error reading message %v \n", err)
				break
			}
		}
	})(conn, sessionID)
}
