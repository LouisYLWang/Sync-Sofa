package handlers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
)

type Hosts struct {
	hosts []string `json:"hosts"`
}

func (ctx *Context) SupportHostsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		w.Header().Add(contentType, contentTypeJSON)
		w.WriteHeader(http.StatusCreated)
		enc := json.NewEncoder(w)
		enc.Encode(ctx.SupportHosts)
		return

	case http.MethodPost:
		newHost, _ := ioutil.ReadAll(r.Body)
		newHostStr := string(newHost)
		if ok :=verifyHostName(newHostStr); ok {
			ctx.SupportHosts = append(ctx.SupportHosts, newHostStr)
		}
		w.Write([]byte("Host Added successfully"))
		return

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}

// TODO: add verification of host name
func verifyHostName(host string) bool {
	return true
}