package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	var req model.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

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

	sessionToken := data["session_token"].(string)
	username := data["username"].(string)
	gameplayID := data["gameplayid"].(string)
	gameplayNum := data["gameplaynum"].(string)

	jwtToken, err := service.GenerateJWT(
		username,
		req.BranchID,
		sessionToken,
		gameplayID,
		gameplayNum,
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
