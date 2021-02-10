package socket

import (
	"sync"

	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/gorilla/websocket"
)

type Store struct {
	ConnectionsMap map[session.SessionID]*websocket.Conn
	Lock           sync.Mutex
	SocketLock     map[session.SessionID]*sync.Mutex
}

func NewStore() *Store {
	return &Store{
		ConnectionsMap: make(map[session.SessionID]*websocket.Conn),
		SocketLock: make(map[session.SessionID]*sync.Mutex),
	}
}
