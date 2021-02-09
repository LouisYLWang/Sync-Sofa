package handlers

import (
	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/LouisYLWang/Sync-Sofa/server/socket"
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
