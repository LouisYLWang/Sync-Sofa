package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/smtp"
)

type FeedbackConfig struct {
	smtpServerHost      string
	smtpServerPort      string
	feedbackAccount     string
	feedbackAccountPswd string
	recipients          []string
}

func InitFeedbackConfig(smtpServerHost string, smtpServerPort string, feedbackAccount string, feedbackAccountPswd string, recipients []string) *FeedbackConfig {
	return &FeedbackConfig{
		smtpServerHost:      smtpServerHost,
		smtpServerPort:      smtpServerPort,
		feedbackAccount:     feedbackAccount,
		feedbackAccountPswd: feedbackAccountPswd,
		recipients:          recipients,
	}
}

func (ctx *Context) FeedbackHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		cfg := ctx.FeedbackConfig
		mailAddr := cfg.smtpServerHost + ":" + cfg.smtpServerPort
		msg, _ := ioutil.ReadAll(r.Body)
		msgByte := []byte(msg)
		auth := smtp.PlainAuth("", cfg.feedbackAccount, cfg.feedbackAccountPswd, cfg.smtpServerHost)
		err := smtp.SendMail(mailAddr, auth, cfg.feedbackAccount, cfg.recipients, msgByte)
		if err != nil {
			fmt.Println(err)
			return
		}
		log.Printf("Email Sent! Request website: %s \n", msg)
		w.Write([]byte("Email Sent!"))

	default:
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
}
