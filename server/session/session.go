package session

import (
	"fmt"
	"log"
	"math/rand"
	"regexp"
	"sync"
	"time"
)

const idLength = 4
const InvalidSessionID SessionID = ""
const letterBytes = "abcdefghijklmnopqrstuvwxyz1234567890"
var reg *regexp.Regexp

type (
	SessionID string

	Store struct {
		SessionMap      map[SessionID]*Room
		SessionDuration time.Duration
		Lock            sync.Mutex
	}

	Room struct {
		RoomID    SessionID `json:"roomID,omitempty"`
		UsrNum    int       `json:"usrNum,omitempty"`
		CurNum	  int       `json:"CurNum,omitempty"`
		BeginTime time.Time `json:"beginTime,omitempty"`
	}
)

func NewStore(sessionDuration time.Duration) *Store {
	return &Store{
		SessionMap:      make(map[SessionID]*Room),
		SessionDuration: sessionDuration,
	}
}

func RandStringBytesRmndr(n int, roomID string) string {
	bytes := make([]byte, n)
	for i := range bytes {
		bytes[i] = letterBytes[rand.Int63()%int64(len(letterBytes))]
	}
	return (roomID + string(bytes))[0:4]
}

// should be create room
func (s Store) CreateHostSession() (SessionID, error) {
	s.Lock.Lock()
	defer s.Lock.Unlock()
	roomID := SessionID(RandStringBytesRmndr(idLength,""))
	newRoom := &Room{
		RoomID: roomID,
		UsrNum: 1,
	}
	s.SessionMap[roomID] = newRoom
	log.Printf("add room %s", roomID)
	hostSessionID := roomID + "0"
	log.Printf("add session %s to room %s", hostSessionID, roomID)
	return hostSessionID, nil
}

// should be removeSessionAndRoom
func (s Store) RemoveSession(roomID SessionID) {
	s.Lock.Lock()
	defer s.Lock.Unlock()

	if room, roomExist := s.SessionMap[roomID]; roomExist {
		if room.UsrNum == 1 {
			delete(s.SessionMap, roomID)
			log.Printf("remove room %s", roomID)
		} else {
			room.UsrNum--
		}
		return
	} else {
		log.Printf("remove a non-existing room %s", roomID)
		return
	}
}

// change to join room
func (s Store) BeginSessions(roomID SessionID) (SessionID, error, bool) {
	if (len(roomID) < 4){
		roomID = SessionID(RandStringBytesRmndr(idLength, string(roomID)))
	}

	roomID = roomID[0:4]
	s.Lock.Lock()
	defer s.Lock.Unlock()
	if _, roomExist := s.SessionMap[roomID]; roomExist {
		room := s.SessionMap[roomID]
		//if room.UsrNum == 1 {
		//	room.UsrNum++
		//	room.BeginTime = time.Now()
		//	guestSessionID := roomID + "1"
		//	log.Printf("add session %s to room %s", guestSessionID, roomID)
		//	return guestSessionID, nil, roomExist
		//} else {
		//	log.Printf("full room")
		//	return InvalidSessionID, nil, roomExist
		//}
		room.UsrNum++
		room.BeginTime = time.Now()
		// 这里换一种方式，从 0 开始，看看哪个位置是空的，给新的id
		// 判断一下CurNum 与 UsrNum是否相等
		guestSessionID := SessionID(fmt.Sprintf("%s%d", roomID, room.UsrNum - 1))
		log.Printf("add session %s to room %s", guestSessionID, roomID)
		return guestSessionID, nil, roomExist
	} else {
		//validation
		pattern := `[a-z0-9]{4}`
		 if !regexp.MustCompile(pattern).MatchString(string(roomID)) {
			 log.Printf("invalid roomID")
			 roomID = ""
		 }
		roomID := SessionID(RandStringBytesRmndr(idLength, string(roomID)))
		newRoom := &Room{
			RoomID: roomID,
			UsrNum: 1,
		}
		s.SessionMap[roomID] = newRoom
		log.Printf("add room %s", roomID)
		hostSessionID := roomID + "0"
		log.Printf("add session %s to room %s", hostSessionID, roomID)
		return hostSessionID, nil, roomExist
	}
}
