package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"slot-backend/internal/middleware"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func GetPromotionDepositHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	var req struct {
		BranchID   string `json:"branch_id"`
		Username   string `json:"username"`
		TypePromo  string `json:"type_promo"`
		TypeWallet string `json:"type_wallet"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	log.Println("=== PROMO MEMBER REQUEST ===")
	log.Println("branch_id:", req.BranchID)
	log.Println("username:", req.Username)
	log.Println("typepromo:", req.TypePromo)
	log.Println("typewallet:", req.TypeWallet)

	if req.BranchID == "" || req.Username == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/content/getdata_promotion_new",
		req,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	log.Println("PROMO RESPONSE:", string(resp))

	var result map[string]interface{}

	if err := json.Unmarshal(resp, &result); err != nil {
		response.Send(w, 500, "Invalid upstream response", nil)
		return
	}

	rcode, _ := result["rcode"].(string)
	message, _ := result["message"].(string)

	if rcode != "00" {
		response.Send(w, 200, message, result)
		return
	}

	response.Send(w, 200, message, result)
}

func GetPromotionHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	var req struct {
		BranchID string `json:"branch_id"`
		Username string `json:"username"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	if req.BranchID == "" || req.Username == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	log.Println("=== PROMO REQUEST ===")
	log.Println("branch_id:", req.BranchID)
	log.Println("username:", req.Username)

	resp, err := service.Post(
		"/account/api/content/getdata_promotion",
		req,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	log.Println("PROMO RESPONSE:", string(resp))

	var result map[string]interface{}

	if err := json.Unmarshal(resp, &result); err != nil {
		response.Send(w, 500, "Invalid upstream response", nil)
		return
	}

	rcode, _ := result["rcode"].(string)
	message, _ := result["message"].(string)

	if rcode != "00" {
		response.Send(w, 200, message, result)
		return
	}

	response.Send(w, 200, message, result)
}
