package utils

import (
	"net"
	"net/http"
)

func GetRealIP(r *http.Request) string {

	// Cloudflare real IP
	cfIP := r.Header.Get("CF-Connecting-IP")
	if cfIP != "" {
		return cfIP
	}

	// X-Forwarded-For
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}

	// fallback
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}

	return ip
}

func NormalizeIPv4(ip string) string {
	parsed := net.ParseIP(ip)
	if parsed == nil {
		return ip
	}

	ipv4 := parsed.To4()
	if ipv4 != nil {
		return ipv4.String()
	}

	return ip // fallback kalau tidak bisa convert
}
