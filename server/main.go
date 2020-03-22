package main

import (
	"log"
	"net/http"
	"time"

	"github.com/LouisYLWang/WatchTogether/server/handlers"
	"github.com/LouisYLWang/WatchTogether/server/session"
	"github.com/LouisYLWang/WatchTogether/server/socket"

	"github.com/gorilla/mux"
)

var sessionDuration = time.Hour

func main() {
	socketStore := socket.NewStore()
	sessionStore := session.NewStore(sessionDuration)
	ctx := handlers.NewContext(socketStore, sessionStore)

	mux := mux.NewRouter()
	//mux.HandleFunc("/ws", ctx.)
	mux.HandleFunc("/v1/session", ctx.SessionHandler)
	mux.HandleFunc("/v1/session/", ctx.SessionSpecificHandler)

	corsMux := handlers.NewCORSHandler(mux)
	log.Fatal(http.ListenAndServe("localhost:3000", corsMux))

}
