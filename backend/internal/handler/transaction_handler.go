package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"slot-backend/internal/middleware"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func DepositHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.Send(w, 400, "Invalid form data", nil)
		return
	}

	// Ambil field text
	branchID := r.FormValue("branch_id")
	username := r.FormValue("username")
	gameplayid := r.FormValue("gameplayid")
	gameplaynum := r.FormValue("gameplaynum")
	wallet := r.FormValue("wallet")
	walletAdmin := r.FormValue("wallet_admin")
	bonus := r.FormValue("bonus")
	amount := r.FormValue("amount")
	description := r.FormValue("description")

	// 🔥 Validasi field WAJIB
	if branchID == "" || username == "" || gameplayid == "" || gameplaynum == "" || wallet == "" || walletAdmin == "" || amount == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	// 🔥 Coba ambil file (optional)
	file, header, err := r.FormFile("image_source")

	if err == nil {
		log.Println("=== FILE RECEIVED FROM FRONTEND ===")
		log.Println("Filename:", header.Filename)
		log.Println("Size:", header.Size)
	} else {
		log.Println("=== FILE NOT RECEIVED ===")
	}

	fields := map[string]string{
		"branch_id":    branchID,
		"username":     username,
		"gameplayid":   gameplayid,
		"gameplaynum":  gameplaynum,
		"wallet":       wallet,
		"wallet_admin": walletAdmin,
		"bonus":        bonus,
		"amount":       amount,
		"description":  description,
	}

	log.Println("=== DEPOSIT REQUEST RECEIVED ===")
	log.Println("branch_id:", branchID)
	log.Println("username:", username)
	log.Println("gameplayid:", gameplayid)
	log.Println("gameplaynum:", gameplaynum)
	log.Println("wallet:", wallet)
	log.Println("wallet_admin:", walletAdmin)
	log.Println("bonus:", bonus)
	log.Println("amount:", amount)
	log.Println("description:", description)

	var resp []byte

	if err == nil {
		// ✅ Ada file → kirim multipart
		defer file.Close()

		resp, err = service.PostMultipart(
			"/account/api/transaction/deposit",
			token,
			fields,
			file,
			header.Filename,
		)

	} else {
		// ✅ Tidak ada file → tetap kirim multipart TANPA file
		resp, err = service.Post(
			"/account/api/transaction/deposit",
			fields,
			token,
		)
	}

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	log.Println("DEPOSIT RESPONSE:", string(resp))

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

func WithdrawHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	var req struct {
		BranchID    string `json:"branch_id"`
		Username    string `json:"username"`
		Gameplayid  string `json:"gameplayid"`
		Gameplaynum string `json:"gameplaynum"`
		Wallet      string `json:"wallet_user"`
		Amount      string `json:"amount"`
		Description string `json:"description"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	log.Println("=== WD REQUEST RECEIVED ===")
	log.Println("branch_id:", req.BranchID)
	log.Println("username:", req.Username)
	log.Println("gameplayid:", req.Gameplayid)
	log.Println("gameplaynum:", req.Gameplaynum)
	log.Println("wallet_user:", req.Wallet)
	log.Println("amount:", req.Amount)
	log.Println("Desc:", req.Description)

	// 🔥 Validasi
	if req.BranchID == "" || req.Username == "" ||
		req.Gameplayid == "" || req.Gameplaynum == "" ||
		req.Wallet == "" || req.Amount == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/transaction/withdraw",
		req,
		token,
	)

	log.Println("WD RESPONSE:", string(resp))

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

	response.Send(w, 200, message, result)
}

func AddBankHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	var req model.AddBankRequest

	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/add_accountbank",
		req,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result interface{}

	json.Unmarshal(resp, &result)

	response.Send(w, 200, "Add bank success", result)
}

func ReferralHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	token := claims.Token
	var req model.ReferralRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/request_refferal",
		req,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result interface{}

	json.Unmarshal(resp, &result)

	response.Send(w, 200, "Referral success", result)
}

func UpdatePopupTransactionHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	token := claims.Token

	var req struct {
		BranchID        string `json:"branch_id"`
		Username        string `json:"username"`
		GameplayID      string `json:"gameplayid"`
		GameplayNum     string `json:"gameplaynum"`
		Txid            string `json:"txid"`
		TransactionType string `json:"transaction_type"`
		FlagPopup       string `json:"flag_popup"`
	}

	log.Println(req)

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/updatepopup_transaction",
		req,
		token,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result interface{}
	json.Unmarshal(resp, &result)

	log.Println(resp)

	response.Send(w, 200, "Popup updated", result)
}
