package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/LouisYLWang/WatchTogether/server/session"
)

const contentType = "Content-Type"
const contentTypeJSON = "application/json"

func (ctx *Context) SessionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		sessionID, err := ctx.SessionStore.CreateHostSession()
		if err != nil {
			log.Printf("failed to create host session: %v", err)
			return
		}

		pair := ctx.SessionStore.SessionMap[sessionID]
		w.Header().Add(contentType, contentTypeJSON)

		if err = respondToClient(w, http.StatusCreated, pair); err != nil {
			http.Error(w, "fail to encode body", http.StatusInternalServerError)
			return
		}

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

func (ctx *Context) SessionSpecificHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		sessionID, err := ctx.SessionStore.BeginSessions(r)
		if err != nil {
			log.Printf("failed to create guest session: %v", err)
			return
		}

		pair := ctx.SessionStore.SessionMap[sessionID]
		w.Header().Add(contentType, contentTypeJSON)

		if err = respondToClient(w, http.StatusCreated, pair); err != nil {
			http.Error(w, "fail to encode body", http.StatusInternalServerError)
			return
		}

	case http.MethodDelete:
		ctx.SessionStore.RemoveSession(r)
		w.WriteHeader(http.StatusOK)

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

func respondToClient(w http.ResponseWriter, respondCode int, pair *session.Pair) error {
	w.WriteHeader(respondCode)
	enc := json.NewEncoder(w)
	return enc.Encode(pair)
}
