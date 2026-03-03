package service

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"slot-backend/internal/config"
	utils "slot-backend/internal/ulits"
)

var client = &http.Client{

	Timeout: 10 * time.Second,

	Transport: &http.Transport{

		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 100,
		MaxConnsPerHost:     100,
		IdleConnTimeout:     90 * time.Second,
	},
}

// func Post(endpoint string, payload interface{}, token string) ([]byte, error) {

// 	url := config.API_BASE_URL + endpoint

// 	jsonData, err := json.Marshal(payload)

// 	if err != nil {
// 		return nil, err
// 	}

// 	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))

// 	if err != nil {
// 		return nil, err
// 	}

// 	req.Header.Set("Content-Type", "application/json")
// 	req.Header.Set("X-Client-API-Key", config.CLIENT_API_KEY)

// 	if token != "" {
// 		req.Header.Set("X-Token", token)
// 	}

// 	resp, err := client.Do(req)

// 	if err != nil {
// 		return nil, err
// 	}

// 	defer resp.Body.Close()

// 	return io.ReadAll(resp.Body)
// }

func Post(endpoint string, payload interface{}, token string) ([]byte, error) {
	return PostWithRequest(nil, endpoint, payload, token)
}

func PostWithRequest(r *http.Request, endpoint string, payload interface{}, token string) ([]byte, error) {
	url := config.API_BASE_URL + endpoint

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Client-API-Key", config.CLIENT_API_KEY)

	if token != "" {
		req.Header.Set("X-Token", token)
	}

	// 🔥 Forward & inject headers
	if r != nil {

		userAgent := r.Header.Get("User-Agent")
		ip := r.Header.Get("X-Real-IP")
		country := r.Header.Get("CF-IPCountry")

		platform := utils.DetectPlatform(userAgent)

		req.Header.Set("User-Agent", userAgent)
		req.Header.Set("X-Forwarded-For", r.Header.Get("X-Forwarded-For"))
		req.Header.Set("X-Real-IP", ip)
		req.Header.Set("CF-IPCountry", country)
		req.Header.Set("X-Platform", platform)

	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}
