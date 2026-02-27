package handler

import (
	"encoding/json"
	"net/http"

	"slot-backend/internal/middleware"
	"slot-backend/internal/service"
)

func GetPromotionHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var payload map[string]interface{}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Force secure fields
	payload["username"] = claims.Username

	resp, err := service.Post(
		"/account/api/content/getdata_promotion_new",
		payload,
		claims.Token,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(resp)
}
