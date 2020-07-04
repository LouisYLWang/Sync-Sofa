package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/LouisYLWang/Sync-Sofa/server/handlers"
	"github.com/LouisYLWang/Sync-Sofa/server/session"
	"github.com/LouisYLWang/Sync-Sofa/server/socket"

	"github.com/gorilla/mux"
)

var sessionDuration = time.Hour

type Config struct {
	Addr    string `json:"addr"`
	Runmode string `json:"runmode"`
	TLSconn struct {
		TLSkey  string `json:"tlskey"`
		TLScert string `json:"tlscert"`
	} `json:"tlsdir"`
	Feedbackservice struct {
		Smtpserverhost    string   `json:"smtpserverhost"`
		Smtpserverport    string   `json:"smtpserverport"`
		Feedbackemailaddr string   `json:"feedbackemailaddr"`
		Feedbackemailpswd string   `json:"feedbackemailpswd"`
		Recipients        []string `json:"recipients"`
	} `json:"feedbackservice"`
}

func main() {
	var (
		cfg                 Config
		addr                string
		runmode             string
		smtpServerHost      string
		smtpServerPort      string
		feedbackAccount     string
		feedbackAccountPswd string
		recipients          []string
		tlsCertPath         string
		tlsKeyPath          string
	)

	if fileExists("config.json") {
		fmt.Println("found config file, read parameters from config file...")
		fileData, err := ioutil.ReadFile("./config.json")
		if err != nil {
			log.Println("incorrect config file")
		} else {
			err = json.Unmarshal(fileData, &cfg)
		}

		if err != nil {
			log.Println("unable to unmarshal file format correctly")
		}

		addr = cfg.Addr
		runmode = cfg.Runmode
		smtpServerHost = cfg.Feedbackservice.Smtpserverhost
		smtpServerPort = cfg.Feedbackservice.Smtpserverport
		feedbackAccount = cfg.Feedbackservice.Feedbackemailaddr
		feedbackAccountPswd = cfg.Feedbackservice.Feedbackemailpswd
		recipients = cfg.Feedbackservice.Recipients

	} else {
		fmt.Println("not found config file, read parameters from system variables...")
		addr = os.Getenv("ADDR")
		if addr == "" {
			log.Println("Please specify the port")
		}
		runmode = os.Getenv("RUNMODE")
		if runmode == "" {
			log.Println("Please choose the hosting mode")
		}
		// below are not required variables
		smtpServerHost = os.Getenv("SMTPSERVERHOST") //"smtp.gmail.com"
		smtpServerPort = os.Getenv("SMTPSERVERPORT") //"587"
		feedbackAccount = os.Getenv("FEEDBACKEMAILADDR")
		feedbackAccountPswd = os.Getenv("FEEDBACKEMAILPSWD")
		recipients = strings.Split(os.Getenv("RECIPIENTS"), ",")
	}

	socketStore := socket.NewStore()
	sessionStore := session.NewStore(sessionDuration)
	FeedbackConfig := handlers.InitFeedbackConfig(smtpServerHost, smtpServerPort, feedbackAccount, feedbackAccountPswd, recipients)
	ctx := handlers.NewContext(socketStore, sessionStore, FeedbackConfig)

	r := mux.NewRouter()
	r.HandleFunc("/v1/session", ctx.SessionHandler)
	r.HandleFunc("/v1/session/", ctx.SessionSpecificHandler)
	r.HandleFunc("/ws/", ctx.WebSocketConnHandler)
	if smtpServerHost != "" {
		r.HandleFunc("/v1/feedback", ctx.FeedbackHandler)
	}

	switch runmode {
	case "dev":
		if len(addr) == 0 {
			addr = ":3000"
		}

		corsMux := handlers.NewCORSHandler(r)
		log.Printf("server is listening at %s...", addr)
		log.Fatal(http.ListenAndServe(addr, corsMux))

	case "prod":

		if fileExists("config.json") {
			tlsCertPath = cfg.TLSconn.TLScert
			tlsKeyPath = cfg.TLSconn.TLSkey
		} else {
			tlsCertPath = os.Getenv("TLSCERT")
			tlsKeyPath = os.Getenv("TLSKEY")
		}
		googleHostVerifyURI := "google8e646393df72ecae.html"

		if addr == "" {
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

		r.HandleFunc(googleHostVerifyURI, file)
		corsMux := handlers.NewCORSHandler(r)
		log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, corsMux))
		log.Printf("server is listening at %s...", addr)

	}
}

func file(w http.ResponseWriter, r *http.Request) {
	googleHostVerifyContent := "google-site-verification: google8e646393df72ecae.html"
	w.Header().Set("Content-type", "text/html")
	w.Write([]byte(googleHostVerifyContent))
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
