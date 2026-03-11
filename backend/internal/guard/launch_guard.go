package guard

import (
	"sync"
	"time"
)

type LaunchGuard struct {
	mutex      sync.Mutex
	lastLaunch map[string]time.Time
}

var guard = &LaunchGuard{
	lastLaunch: make(map[string]time.Time),
}

const LaunchCooldown = 3 * time.Second

func AllowLaunch(key string) bool {

	guard.mutex.Lock()
	defer guard.mutex.Unlock()

	last, exists := guard.lastLaunch[key]

	if exists && time.Since(last) < LaunchCooldown {
		return false
	}

	guard.lastLaunch[key] = time.Now()

	if len(guard.lastLaunch) > 10000 {
		guard.lastLaunch = make(map[string]time.Time)
	}

	return true
}
