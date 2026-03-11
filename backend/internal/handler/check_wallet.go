package handler

import (
	"encoding/json"
	"net/http"

	"slot-backend/internal/config"
	"slot-backend/internal/middleware"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func CheckWalletUserHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		http.Error(w, "Missing Session", http.StatusUnauthorized)
		return
	}

	token := claims.Token

	var req model.CheckWalletUser

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	payload := map[string]interface{}{
		"branch_id":        config.BRANCH_ID,
		"username":         claims.Username,
		"transaction_type": req.TypeTransaction,
		"id_tier":          req.TierID,
		"type_wallet":      req.TypeWallet,
	}

	resp, err := service.Post(
		"/account/api/manage/check_wallet_user",
		payload,
		token,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(resp)
}

func CheckWalletHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		http.Error(w, "Missing Session", http.StatusUnauthorized)
		return
	}

	token := claims.Token

	var req struct {
		Username string `json:"username"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id": config.BRANCH_ID,
		"username":  claims.Username,
	}

	resp, err := service.Post(
		"/account/api/manage/check_wallet",
		payload,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result interface{}
	json.Unmarshal(resp, &result)

	response.Send(w, 200, "Success", result)
}
