package handlers

import (
	"encoding/json"
	"net/http"
)

type Status struct {
	ConnNum int `json:"connNum"`
}

func (ctx *Context) StatusConnHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		w.Header().Add(contentType, contentTypeJSON)

		status := &Status{
			ConnNum: len(ctx.SocketStore.ConnectionsMap),
		}
		w.Header().Add(contentType, contentTypeJSON)
		err := respondStatusToClient(w, http.StatusCreated, status)
		if err != nil {
			http.Error(w, "fail to encode body", http.StatusInternalServerError)
			return
		}

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

func respondStatusToClient(w http.ResponseWriter, respondCode int, status *Status) error {
	w.WriteHeader(respondCode)
	enc := json.NewEncoder(w)
	return enc.Encode(status)
}
