package handler

import (
	"encoding/json"
	"net/http"

	"slot-backend/internal/config"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	utils "slot-backend/internal/ulits"
	"slot-backend/pkg/response"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {

	var req model.LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	// 🔥 Ambil IP client dari request
	clientIP := utils.GetRealIP(r)
	clientIP = utils.NormalizeIPv4(clientIP)

	// 🔥 Tambahkan ke request yang dikirim ke provider
	req.ClientIP = clientIP

	payload := map[string]interface{}{
		"branch_id": config.BRANCH_ID,
		"username":  req.Username,
		"password":  req.Password,
		"client_ip": req.ClientIP,
	}

	resp, err := service.Post(
		"/account/api/manage/login",
		payload,
		"",
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result map[string]interface{}
	json.Unmarshal(resp, &result)

	rcode, _ := result["rcode"].(string)
	message, _ := result["message"].(string)

	if rcode != "00" {
		response.Send(w, 400, message, result)
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
		config.BRANCH_ID,
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

	clientIP := utils.GetRealIP(r)
	clientIP = utils.NormalizeIPv4(clientIP)

	// 🔥 Tambahkan ke request yang dikirim ke provider
	req.ClientIP = clientIP

	payload := map[string]interface{}{
		"branch_id":      config.BRANCH_ID,
		"username":       req.Username,
		"password":       req.Password,
		"email":          req.Email,
		"phonenumber":    req.PhoneNumber,
		"refferal":       req.Refferal,
		"type_wallet":    req.TypeWallet,
		"id_wallet":      req.IDWallet,
		"account_name":   req.AccountName,
		"account_number": req.AccountNumber,
		"client_ip":      req.ClientIP,
	}

	if config.BRANCH_ID == "" || req.Username == "" ||
		req.Password == "" || req.Email == "" ||
		req.PhoneNumber == "" || req.Refferal == "" ||
		req.TypeWallet == "" || req.IDWallet == "" ||
		req.AccountName == "" || req.AccountNumber == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/register",
		payload,
		"",
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result map[string]interface{}

	if err := json.Unmarshal(resp, &result); err != nil {
		response.Send(w, 500, "Invalid upstream response", nil)
		return
	}

	rcode, _ := result["rcode"].(string)
	message, _ := result["message"].(string)

	if rcode != "00" {
		response.Send(w, 400, message, result)
		return
	}

	response.Send(w, 200, message, result)
}
