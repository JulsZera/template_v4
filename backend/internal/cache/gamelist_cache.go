package cache

import (
	"sync"
	"time"
)

type GameListCache struct {
	Data      map[string][]byte
	Version   map[string]int64
	UpdatedAt map[string]time.Time
	mutex     sync.RWMutex
}

var gameListCache = &GameListCache{
	Data:      make(map[string][]byte),
	Version:   make(map[string]int64),
	UpdatedAt: make(map[string]time.Time),
}
var gameListGlobalVersion int64
var GameListTTL = 10 * time.Second

func GetGameList(key string) ([]byte, bool) {

	gameListCache.mutex.RLock()
	defer gameListCache.mutex.RUnlock()

	data, ok := gameListCache.Data[key]

	if !ok {
		return nil, false
	}

	fresh := time.Since(gameListCache.UpdatedAt[key]) < GameListTTL

	return data, fresh
}

func SetGameList(key string, data []byte) {

	gameListCache.mutex.Lock()
	defer gameListCache.mutex.Unlock()

	gameListCache.Data[key] = data
	gameListCache.UpdatedAt[key] = time.Now()
	gameListCache.Version[key] = time.Now().Unix()

	// update global version
	gameListGlobalVersion = time.Now().Unix()
}

func GetGameListGlobalVersion() int64 {

	gameListCache.mutex.RLock()
	defer gameListCache.mutex.RUnlock()

	return gameListGlobalVersion
}
