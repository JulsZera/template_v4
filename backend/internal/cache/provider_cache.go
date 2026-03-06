package cache

import (
	"sync"
	"time"
)

var providerGlobalVersion int64

type ProviderCache struct {
	Data      map[string][]byte
	Version   map[string]int64
	UpdatedAt map[string]time.Time
	mutex     sync.RWMutex
}

var providerCache = &ProviderCache{
	Data:      make(map[string][]byte),
	Version:   make(map[string]int64),
	UpdatedAt: make(map[string]time.Time),
}

var ProviderTTL = 10 * time.Second

func GetProviders(category string) ([]byte, bool) {

	providerCache.mutex.RLock()
	defer providerCache.mutex.RUnlock()

	data, ok := providerCache.Data[category]

	if !ok {
		return nil, false
	}

	fresh := time.Since(providerCache.UpdatedAt[category]) < ProviderTTL

	return data, fresh
}

func SetProviders(category string, data []byte) {

	providerCache.mutex.Lock()
	defer providerCache.mutex.Unlock()

	providerCache.Data[category] = data
	providerCache.UpdatedAt[category] = time.Now()
	providerCache.Version[category] = time.Now().Unix()

	// update global version
	providerGlobalVersion = time.Now().Unix()
}

func GetProvidersGlobalVersion() int64 {

	providerCache.mutex.RLock()
	defer providerCache.mutex.RUnlock()

	return providerGlobalVersion
}
