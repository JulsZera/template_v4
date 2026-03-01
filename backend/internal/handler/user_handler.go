package handler

import (
	"encoding/json"
	"net/http"

	"slot-backend/internal/middleware"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func GetProfileHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	req := model.ProfileRequest{
		BranchID:    claims.BranchID,
		Username:    claims.Username,
		GameplayID:  claims.GameplayID,
		GameplayNum: claims.GameplayNum,
		Function:    "datareff",
	}

	resp, err := service.Post(
		"/account/api/data/profile",
		req,
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

func GetBalanceHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	req := model.BalanceRequest{
		BranchID:    claims.BranchID,
		Username:    claims.Username,
		GameplayID:  claims.GameplayID,
		GameplayNum: claims.GameplayNum,
	}

	resp, err := service.Post(
		"/account/api/manage/get_balance",
		req,
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

func GetProviderHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	var req model.ProviderRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/content/getdata_provider",
		req,
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

func GetWalletHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	var req model.WalletRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/check_wallet",
		req,
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

func GetHistoryHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	var req struct {
		BranchID  string `json:"branch_id"`
		Username  string `json:"username"`
		StartDate string `json:"start_date"`
		EndDate   string `json:"end_date"`
		Type      string `json:"type"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/data/history_transaction",
		req,
		token,
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

	response.Send(w, 200, "Success", result)
}
