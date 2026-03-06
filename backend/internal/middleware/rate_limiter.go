package middleware

import (
	"log"
	"net/http"
	utils "slot-backend/internal/ulits"
	"sync"
	"time"
)

type client struct {
	count      int
	lastAccess time.Time
}

var (
	clients = make(map[string]*client)
	mutex   sync.Mutex
)

const (
	maxRequests = 50
	window      = 20 * time.Second
)

func RateLimiter(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ip := utils.GetRealIP(r)

		log.Println("Client IP:", ip)

		mutex.Lock()

		c, exists := clients[ip]

		if !exists {

			clients[ip] = &client{
				count:      1,
				lastAccess: time.Now(),
			}

			mutex.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		if time.Since(c.lastAccess) > window {

			c.count = 1
			c.lastAccess = time.Now()

			mutex.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		c.count++

		if c.count > maxRequests {

			mutex.Unlock()

			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		mutex.Unlock()

		next.ServeHTTP(w, r)
	})
}
