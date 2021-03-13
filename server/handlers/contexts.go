package handlers

import (
	"SyncSofa/server/session"
	"SyncSofa/server/socket"
)

type Context struct {
	SocketStore    *socket.Store
	SessionStore   *session.Store
	FeedbackConfig *FeedbackConfig
	SupportHosts   []string
}

func NewContext(socketStore *socket.Store, sessionStore *session.Store, feedbackconfig *FeedbackConfig) *Context {
	return &Context{
		SocketStore:    socketStore,
		SessionStore:   sessionStore,
		FeedbackConfig: feedbackconfig,
		SupportHosts: 	make([]string, 0),
	}
}
