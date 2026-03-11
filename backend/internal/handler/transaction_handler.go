package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"slot-backend/internal/config"
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
	branchID := config.BRANCH_ID
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

	var req model.WithdrawRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id":   config.BRANCH_ID,
		"username":    claims.Username,
		"gameplayid":  claims.GameplayID,
		"gameplaynum": claims.GameplayNum,
		"wallet_user": req.WalletUser,
		"amount":      req.Amount,
		"description": req.Description,
	}

	log.Println("=== WD REQUEST RECEIVED ===")
	log.Println("branch_id:", config.BRANCH_ID)
	log.Println("username:", claims.Username)
	log.Println("gameplayid:", claims.GameplayID)
	log.Println("gameplaynum:", claims.GameplayNum)
	log.Println("wallet_user:", req.WalletUser)
	log.Println("amount:", req.Amount)
	log.Println("Desc:", req.Description)

	// 🔥 Validasi
	if config.BRANCH_ID == "" || claims.Username == "" ||
		claims.GameplayID == "" || claims.GameplayNum == "" ||
		req.WalletUser == "" || req.Amount == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/transaction/withdraw",
		payload,
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

	payload := map[string]interface{}{
		"branch_id":      config.BRANCH_ID,
		"username":       claims.Username,
		"gameplayid":     claims.GameplayID,
		"gameplaynum":    claims.GameplayNum,
		"email":          claims.Email,
		"type_wallet":    req.TypeWallet,
		"id_wallet":      req.IDWallet,
		"account_name":   req.AccountName,
		"account_number": req.AccountNumber,
	}

	// 🔥 Validasi
	if config.BRANCH_ID == "" || claims.Username == "" ||
		claims.GameplayID == "" || claims.GameplayNum == "" ||
		req.TypeWallet == "" || req.IDWallet == "" ||
		req.AccountName == "" || req.AccountNumber == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/add_accountbank",
		payload,
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

	response.Send(w, 200, message, result)
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

	payload := map[string]interface{}{
		"branch_id":      config.BRANCH_ID,
		"username":       claims.Username,
		"gameplayid":     claims.GameplayID,
		"gameplaynum":    claims.GameplayNum,
		"name":           claims.Name,
		"email":          req.Email,
		"address":        req.Address,
		"phonenumber":    claims.Phonenumber,
		"id_wallet":      req.IDWallet,
		"type_wallet":    req.TypeWallet,
		"account_name":   req.AccountName,
		"account_number": req.AccountNumber,
	}

	resp, err := service.Post(
		"/account/api/manage/request_refferal",
		payload,
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

	response.Send(w, 200, message, result)
}

func UpdatePopupTransactionHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	token := claims.Token

	var req model.UpdatePopupRequest
	log.Println(req)

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id":        config.BRANCH_ID,
		"username":         claims.Username,
		"gameplayid":       claims.GameplayID,
		"gameplaynum":      claims.GameplayNum,
		"txid":             req.TxID,
		"transaction_type": req.TransactionType,
		"flag_popup":       req.FlagPopup,
	}

	resp, err := service.Post(
		"/account/api/manage/updatepopup_transaction",
		payload,
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

	response.Send(w, 200, message, result)
}
