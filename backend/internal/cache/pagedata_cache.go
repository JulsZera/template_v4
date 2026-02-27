package cache

import (
	"sync"
	"time"
)

type PageDataCache struct {
	Data      []byte
	UpdatedAt time.Time
	mutex     sync.RWMutex
}

var pageDataCache = &PageDataCache{}

var CacheTTL = 30 * time.Second

func GetPageData() ([]byte, bool) {

	pageDataCache.mutex.RLock()
	defer pageDataCache.mutex.RUnlock()

	if pageDataCache.Data == nil {
		return nil, false
	}

	fresh := time.Since(pageDataCache.UpdatedAt) < CacheTTL

	return pageDataCache.Data, fresh
}

func SetPageData(data []byte) {

	pageDataCache.mutex.Lock()
	defer pageDataCache.mutex.Unlock()

	pageDataCache.Data = data
	pageDataCache.UpdatedAt = time.Now()
}
