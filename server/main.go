package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/LouisYLWang/WatchTogether/server/handlers"
	"github.com/LouisYLWang/WatchTogether/server/session"
	"github.com/LouisYLWang/WatchTogether/server/socket"

	"github.com/gorilla/mux"
)

var sessionDuration = time.Hour

func main() {
	addr := os.Getenv("ADDR")
	tlsCertPath := os.Getenv("TLSCERT")
	tlsKeyPath := os.Getenv("TLSKEY")

	if len(addr) == 0 {
		addr = ":443"
	}
	if tlsCertPath == "" {
		fmt.Printf("invalid path to TLS public certificate")
		os.Exit(1)
	}
	if tlsKeyPath == "" {
		fmt.Printf("invalid path to the associated private key")
		os.Exit(1)
	}
	socketStore := socket.NewStore()
	sessionStore := session.NewStore(sessionDuration)
	ctx := handlers.NewContext(socketStore, sessionStore)

	mux := mux.NewRouter()
	mux.HandleFunc("/v1/session", ctx.SessionHandler)
	mux.HandleFunc("/v1/session/", ctx.SessionSpecificHandler)
	mux.HandleFunc("/ws/", ctx.WebSocketConnHandler)

	corsMux := handlers.NewCORSHandler(mux)
	//log.Fatal(http.ListenAndServe("localhost:3000", corsMux))
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, corsMux))

}
