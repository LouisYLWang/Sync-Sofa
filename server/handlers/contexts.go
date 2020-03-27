package handlers

import (
	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/LouisYLWang/Sync-Sofa/server/socket"
)

type Context struct {
	SocketStore  *socket.Store
	SessionStore *session.Store
}

func NewContext(socketStore *socket.Store, sessionStore *session.Store) *Context {
	return &Context{
		SocketStore:  socketStore,
		SessionStore: sessionStore,
	}
}
