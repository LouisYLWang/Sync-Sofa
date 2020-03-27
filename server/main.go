package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/LouisYLWang/Sync-Sofa/server/handlers"
	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/LouisYLWang/Sync-Sofa/server/socket"

	"github.com/gorilla/mux"
)

var sessionDuration = time.Hour

func main() {
	addr := os.Getenv("ADDR")
	tlsCertPath := os.Getenv("TLSCERT")
	tlsKeyPath := os.Getenv("TLSKEY")
	googleHostVerifyURI := os.Getenv("VERIFYURI")

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

	r := mux.NewRouter()
	r.HandleFunc("/v1/session", ctx.SessionHandler)
	r.HandleFunc("/v1/session/", ctx.SessionSpecificHandler)
	r.HandleFunc("/ws/", ctx.WebSocketConnHandler)
	r.HandleFunc(googleHostVerifyURI, file)
	corsMux := handlers.NewCORSHandler(r)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, corsMux))

}

func file(w http.ResponseWriter, r *http.Request) {
	googleHostVerifyContent := os.Getenv("VERIFYCONTENT")
	w.Header().Set("Content-type", "text/html")
	w.Write([]byte(googleHostVerifyContent))
}
