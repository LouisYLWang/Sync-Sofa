package session

import (
	"crypto/rand"
	b64 "encoding/base64"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

const paramID = "id"
const idLength = 3
const InvalidSessionID SessionID = ""

type SessionID string

type Store struct {
	SessionMap      map[SessionID]*Pair
	SessionDuration time.Duration
	Lock            sync.Mutex
}

type Pair struct {
	PartnerID SessionID `json:"partnerID,omitempty"`
	SelfID    SessionID `json:"selfID,omitempty"`
	BeginTime time.Time `json:"beginTime,omitempty"`
}

func NewStore(sessionDuration time.Duration) *Store {
	return &Store{
		SessionMap:      make(map[SessionID]*Pair),
		SessionDuration: sessionDuration,
	}
}

func (s Store) CreateHostSession() (SessionID, error) {
	s.Lock.Lock()
	defer s.Lock.Unlock()

	id := make([]byte, idLength)
	_, err := rand.Read(id)
	if err != nil {
		return InvalidSessionID, fmt.Errorf("not correctly generate cryptographically random: %v", err)
	}
	sessionID := SessionID(b64.URLEncoding.EncodeToString(id))
	newPair := &Pair{
		SelfID: sessionID,
	}
	s.SessionMap[sessionID] = newPair
	log.Printf("add session by %s", sessionID)
	return sessionID, nil
}

func (s Store) RemoveSession(r *http.Request) {
	s.Lock.Lock()
	defer s.Lock.Unlock()
	sessionID := r.URL.Query().Get(paramID)
	delete(s.SessionMap, SessionID(sessionID))
	log.Printf("remove session of %s", sessionID)
}

func (s Store) BeginSessions(r *http.Request) (SessionID, error) {
	s.Lock.Lock()
	defer s.Lock.Unlock()
	hostSessionID := SessionID(r.URL.Query().Get(paramID))

	if _, roomExist := s.SessionMap[hostSessionID]; roomExist {
		id := make([]byte, idLength)
		_, err := rand.Read(id)
		if err != nil {
			return InvalidSessionID, fmt.Errorf("not correctly generate cryptographically random: %v", err)
		}

		sessionID := SessionID(b64.URLEncoding.EncodeToString(id))

		guestPair := &Pair{
			SelfID:    sessionID,
			PartnerID: hostSessionID,
			BeginTime: time.Now(),
		}
		s.SessionMap[sessionID] = guestPair

		hostPair := s.SessionMap[hostSessionID]
		hostPair.PartnerID = sessionID
		hostPair.BeginTime = time.Now()

		log.Printf("add session by %s", sessionID)
		return sessionID, nil
	}

	log.Printf("wrong sessionID")
	return InvalidSessionID, nil
}
