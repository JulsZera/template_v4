package handler

import (
	"encoding/json"
	"log"
	"net"
	"net/http"

	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func GetClientIP(r *http.Request) string {

	// 1️⃣ Cloudflare
	ip := r.Header.Get("CF-Connecting-IP")

	// 2️⃣ X-Forwarded-For
	if ip == "" {
		ip = r.Header.Get("X-Forwarded-For")
	}

	// 3️⃣ RemoteAddr
	if ip == "" {
		ip, _, _ = net.SplitHostPort(r.RemoteAddr)
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

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	var req model.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	// 🔥 Ambil IP client dari request
	clientIP := GetClientIP(r)
	clientIP = NormalizeIPv4(clientIP)

	// 🔥 Tambahkan ke request yang dikirim ke provider
	req.ClientIP = clientIP

	resp, err := service.Post(
		"/account/api/manage/login",
		req,
		"",
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result map[string]interface{}

	json.Unmarshal(resp, &result)

	log.Println("LOGIN API RESPONSE:", result)

	if result["rcode"] != "00" {

		response.Send(w, 401, "Login failed", result)
		return
	}

	data := result["data"].(map[string]interface{})

	name := data["name"].(string)
	name_unique := data["name_unique"].(string)
	email := data["email"].(string)
	phone := data["phonenumber"].(string)
	sessionToken := data["session_token"].(string)
	username := data["username"].(string)
	gameplayID := data["gameplayid"].(string)
	gameplayNum := data["gameplaynum"].(string)

	jwtToken, err := service.GenerateJWT(
		name,
		name_unique,
		email,
		phone,
		username,
		req.BranchID,
		sessionToken,
		gameplayID,
		gameplayNum,
		clientIP,
	)

	if err != nil {

		response.Send(w, 500, "JWT error", nil)
		return
	}

	response.Send(w, 200, "Login success", map[string]interface{}{
		"jwt": jwtToken,
	})
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {

	var req model.RegisterRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {

		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/register",
		req,
		"",
	)

	if err != nil {

		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result interface{}

	json.Unmarshal(resp, &result)

	response.Send(w, 200, "Register success", result)
}
