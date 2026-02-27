package handler

import (
	"encoding/json"
	"net/http"

	"slot-backend/internal/middleware"
	"slot-backend/internal/service"
)

func CheckWalletHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		http.Error(w, "Missing Session", http.StatusUnauthorized)
		return
	}

	token := claims.Token

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
