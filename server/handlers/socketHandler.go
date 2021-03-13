package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"SyncSofa/server/session"
	"github.com/gorilla/websocket"
)

const paramID = "id"

type (
	msg struct {
		Type    string `json:"type"`
		Content string `json:"content"`
	}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (ctx *Context) InserConnection(id session.SessionID, conn *websocket.Conn, lock *sync.Mutex) {
	ctx.SocketStore.Lock.Lock()
	defer ctx.SocketStore.Lock.Unlock()
	ctx.SocketStore.ConnectionsMap[id] = conn
	ctx.SocketStore.SocketLock[id] = lock
	log.Println("socket connected to session: ", id)
}

func (ctx *Context) RemoveConnection(sessionID session.SessionID, conn *websocket.Conn) {
	ctx.SocketStore.Lock.Lock()
	defer ctx.SocketStore.Lock.Unlock()
	// defer delete(ctx.SessionStore.SessionMap, GetRoomID(sessionID))
	_, roomID := GetSelfIDs(sessionID)
	ctx.SessionStore.SessionMap[roomID].CurNum--
	delete(ctx.SocketStore.ConnectionsMap, sessionID)
	log.Printf("socket remove connection to session: %s, current user %d", sessionID, ctx.SessionStore.SessionMap[roomID].CurNum)
	if ctx.SessionStore.SessionMap[roomID].CurNum == 0 {
		delete(ctx.SessionStore.SessionMap, GetRoomID(sessionID))
		log.Printf("room %s removed", roomID)
	}
	// for i := 0; session.SessionID(i) != usrID && i < ctx.SessionStore.SessionMap[roomID].UsrNum; i++ {
	// 	partnerID := session.SessionID(fmt.Sprintf("%v%d", roomID, i))
	// 	partnerConn, exist := ctx.SocketStore.ConnectionsMap[partnerID]
	// 	// if exist {
	// 	// 	log.Printf("partner cient %s been force closed\n", sessionID)
	// 	// 	partnerConn.WriteMessage(websocket.TextMessage, []byte("-1"))
	// 	// }
	// 	conn.WriteMessage(websocket.TextMessage, []byte("-1"))
	// 	delete(ctx.SocketStore.ConnectionsMap, sessionID)
	// 	log.Println("socket remove connection to session: ", sessionID)
	// }
}

func GetSelfIDs(selfID session.SessionID) (session.SessionID, session.SessionID) {
	if len(selfID) != 5 {
		return session.InvalidSessionID, session.InvalidSessionID
	}
	usrID := selfID[len(selfID)-1 : len(selfID)]
	roomID := selfID[0 : len(selfID)-1]
	return usrID, roomID
}

func GetRoomID(selfID session.SessionID) session.SessionID {
	return selfID[0 : len(selfID)-1]
}

func (ctx *Context) WebSocketConnHandler(w http.ResponseWriter, r *http.Request) {
	sessionID := session.SessionID(r.URL.Query().Get(paramID))
	if len(sessionID) != 5 {
		http.Error(w, "failed to open websocket connection", http.StatusUnauthorized)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	var lock = &sync.Mutex{}
	if err != nil {
		http.Error(w, "failed to open websocket connection", http.StatusUnauthorized)
		return
	}
	fmt.Printf("open websocket connection to %s \n", sessionID)
	ctx.InserConnection(sessionID, conn, lock)

	go (func(conn *websocket.Conn, id session.SessionID) {
		defer conn.Close()
		defer ctx.RemoveConnection(id, conn)
		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Printf("err %v \n", err)
				log.Printf("forced close by cient %s \n", id)
				break
			}
			log.Printf("client %s operate \n", id)
			//conn.WriteMessage(websocket.TextMessage, p)
			usrID, roomID := GetSelfIDs(sessionID)
			for i := 0; i < ctx.SessionStore.SessionMap[roomID].UsrNum; i++ {
				if strconv.Itoa(i) == string(usrID) {
					continue
				}
				partnerID := session.SessionID(fmt.Sprintf("%v%d", roomID, i))
				partnerConn, clientExist := ctx.SocketStore.ConnectionsMap[partnerID]
				partnerLock, _ := ctx.SocketStore.SocketLock[partnerID]
				if clientExist {
					if ctx.SessionStore.SessionMap[roomID].CurIndex == i {
						ctx.SessionStore.SessionMap[roomID].CurIndex = ctx.SessionStore.SessionMap[roomID].UsrNum
					}
					if messageType == websocket.TextMessage {
						pMsg := &msg{}
						json.Unmarshal(p, pMsg)
						if pMsg.Content == "-1" && pMsg.Type == "1" {
							pMsg.Content = "-9"
							p, _ = json.Marshal(pMsg)
						}
						// TODO：给每个socket链接一把锁 与 partnerConn 绑定的锁，这里锁一下
						partnerLock.Lock()
						partnerConn.WriteMessage(websocket.TextMessage, p)
						partnerLock.Unlock()
						// 这里解锁
					} else if messageType == websocket.CloseMessage {
						log.Printf("close message received from cient %s \n", id)
						delete(ctx.SessionStore.SessionMap, GetRoomID(sessionID))
						break
					} else if err != nil {
						log.Printf("error reading message %v \n", err)
						break
					}
				} else {
					ctx.SessionStore.SessionMap[roomID].CurIndex = i
				}
			}
		}
	})(conn, sessionID)
}
