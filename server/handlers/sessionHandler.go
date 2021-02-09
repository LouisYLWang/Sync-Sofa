package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"log"
	"net/http"
)

const contentType = "Content-Type"
const contentTypeJSON = "application/json"

type (
	Session struct {
		SelfID      string `json:"selfID,omitempty"`
		PairExisted bool   `json:"pairExisted,omitempty"`
	}
)

func (ctx *Context) SessionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		sessionID, err := ctx.SessionStore.CreateHostSession()
		if err != nil {
			log.Printf("failed to create host session: %v", err)
			return
		}
		session := &Session{SelfID: string(sessionID)}
		w.Header().Add(contentType, contentTypeJSON)
		if err = respondToClient(w, http.StatusCreated, session); err != nil {
			http.Error(w, "fail to encode body", http.StatusInternalServerError)
			return
		}

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

func (ctx *Context) SessionSpecificHandler(w http.ResponseWriter, r *http.Request) {
	pairID := session.SessionID(r.URL.Query().Get(paramID))

	switch r.Method {
	case http.MethodGet:
		sessionID, err, pairExist := ctx.SessionStore.BeginSessions(pairID)
		if err != nil {
			log.Printf("failed to create guest session: %v", err)
			return
		}
		session := &Session{
			SelfID:      string(sessionID),
			PairExisted: pairExist,
		}
		w.Header().Add(contentType, contentTypeJSON)

		if err = respondToClient(w, http.StatusCreated, session); err != nil {
			http.Error(w, "fail to encode body", http.StatusInternalServerError)
			return
		}

	case http.MethodDelete:
		fmt.Println("test here!")
		ctx.SessionStore.RemoveSession(pairID)
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

func respondToClient(w http.ResponseWriter, respondCode int, session *Session) error {
	w.WriteHeader(respondCode)
	enc := json.NewEncoder(w)
	return enc.Encode(session)
}
