package session

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

const idLength = 4
const InvalidSessionID SessionID = ""
const letterBytes = "abcdefghijklmnopqrstuvwxyz1234567890"

type (
	SessionID string

	Store struct {
		SessionMap      map[SessionID]*Pair
		SessionDuration time.Duration
		Lock            sync.Mutex
	}

	Pair struct {
		PairID    SessionID `json:"pairID,omitempty"`
		UsrNum    int       `json:"usrNum,omitempty"`
		BeginTime time.Time `json:"beginTime,omitempty"`
	}
)

func NewStore(sessionDuration time.Duration) *Store {
	return &Store{
		SessionMap:      make(map[SessionID]*Pair),
		SessionDuration: sessionDuration,
	}
}

func RandStringBytesRmndr(n int) string {
	bytes := make([]byte, n)
	for i := range bytes {
		bytes[i] = letterBytes[rand.Int63()%int64(len(letterBytes))]
	}
	return string(bytes)
}

// should be create pair
func (s Store) CreateHostSession() (SessionID, error) {
	s.Lock.Lock()
	defer s.Lock.Unlock()
	pairID := SessionID(RandStringBytesRmndr(idLength))
	newPair := &Pair{
		PairID: pairID,
		UsrNum: 1,
	}
	s.SessionMap[pairID] = newPair
	log.Printf("add pair %s", pairID)
	hostSessionID := pairID + "0"
	log.Printf("add session %s to pair %s", hostSessionID, pairID)
	return hostSessionID, nil
}

// should be removeSessionAndPair
func (s Store) RemoveSession(pairID SessionID) {
	s.Lock.Lock()
	defer s.Lock.Unlock()

	if pair, pairExist := s.SessionMap[pairID]; pairExist {
		if pair.UsrNum == 1 {
			delete(s.SessionMap, pairID)
			log.Printf("remove pair %s", pairID)
		} else {
			pair.UsrNum--
		}
		return
	} else {
		log.Printf("remove a non-existing pair %s", pairID)
		return
	}
}

// change to join pair
func (s Store) BeginSessions(pairID SessionID) (SessionID, error, bool) {
	s.Lock.Lock()
	defer s.Lock.Unlock()
	if _, pairExist := s.SessionMap[pairID]; pairExist {
		pair := s.SessionMap[pairID]
		if pair.UsrNum == 1 {
			pair.UsrNum++
			pair.BeginTime = time.Now()
			questSessionID := pairID + "1"
			log.Printf("add session %s to pair %s", questSessionID, pairID)
			return questSessionID, nil, pairExist
		} else {
			log.Printf("full pair")
			return InvalidSessionID, nil, pairExist
		}
	} else {
		newPair := &Pair{
			PairID: pairID,
			UsrNum: 1,
		}
		s.SessionMap[pairID] = newPair
		log.Printf("add pair %s", pairID)
		hostSessionID := pairID + "0"
		log.Printf("add session %s to pair %s", hostSessionID, pairID)
		return hostSessionID, nil, pairExist
	}
}
