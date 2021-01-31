package socket

import (
	"sync"

	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/gorilla/websocket"
)

type (
	Store struct {
		ConnectionsMap map[session.SessionID]*Connection
		Lock           sync.Mutex
	}

	Connection struct {
		ConnSocket *websocket.Conn
		Lock       sync.Mutex
	}
)

func NewStore() *Store {
	return &Store{
		ConnectionsMap: make(map[session.SessionID]*Connection),
	}
}
