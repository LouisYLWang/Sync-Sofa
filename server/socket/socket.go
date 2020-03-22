package socket

import (
	"sync"

	"github.com/LouisYLWang/WatchTogether/server/session"
	"github.com/gorilla/websocket"
)

type Store struct {
	ConnectionsMap map[session.SessionID]*websocket.Conn
	Lock           sync.Mutex
}

func NewStore() *Store {
	return &Store{
		ConnectionsMap: make(map[session.SessionID]*websocket.Conn),
	}
}
