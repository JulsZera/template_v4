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

func GetProfileHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)

	token := claims.Token

	// Decode body dari frontend
	var body struct {
		Function string `json:"function"`
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		response.Send(w, 400, "Invalid request body", nil)
		return
	}

	// Default fallback (biar aman)
	function := body.Function
	if function == "" {
		function = "dataprofile"
	}

	req := model.ProfileRequest{
		BranchID:    claims.BranchID,
		Username:    claims.Username,
		GameplayID:  claims.GameplayID,
		GameplayNum: claims.GameplayNum,
		Function:    function,
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

func ListBankPublicHandler(w http.ResponseWriter, r *http.Request) {

	var req struct {
		BranchID string `json:"branch_id"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	if req.BranchID == "" {
		response.Send(w, 400, "Branch ID required", nil)
		return
	}

	log.Println("=== LIST BANK PUBLIC ===")
	log.Println("branch_id:", req.BranchID)

	resp, err := service.Post(
		"/account/api/content/listbank",
		map[string]string{
			"branch_id": req.BranchID,
		},
		"", // 🔥 TANPA TOKEN
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result map[string]interface{}
	json.Unmarshal(resp, &result)

	response.Send(w, 200, "Success", result)
}

func ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	token := claims.Token

	var body struct {
		OldPassword string `json:"oldpassword"`
		Password    string `json:"password"`
		ClientIP    string `json:"client_ip"`
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	req := map[string]interface{}{
		"branch_id":   claims.BranchID,
		"username":    claims.Username,
		"oldpassword": body.OldPassword,
		"password":    body.Password,
		"client_ip":   body.ClientIP,
	}

	resp, err := service.Post(
		"/account/api/manage/change_password",
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

	response.Send(w, 200, message, result)
}

func CheckRequestRefferalHandler(w http.ResponseWriter, r *http.Request) {

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
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/check_request_refferal",
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

func TurnoverHandler(w http.ResponseWriter, r *http.Request) {

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
		Category    string `json:"category"`
		Provider    string `json:"provider"`
		StartDate   string `json:"start_date"`
		EndDate     string `json:"end_date"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/data/turnover",
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

func RequestReferralHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.Send(w, 400, "Invalid form data", nil)
		return
	}

	// ===============================
	// Ambil field text
	// ===============================

	branchID := r.FormValue("branch_id")
	username := r.FormValue("username")
	gameplayid := r.FormValue("gameplayid")
	gameplaynum := r.FormValue("gameplaynum")
	name := r.FormValue("name")
	email := r.FormValue("email")
	address := r.FormValue("address")
	phonenumber := r.FormValue("phonenumber")
	idWallet := r.FormValue("id_wallet")
	typeWallet := r.FormValue("type_wallet")
	accountName := r.FormValue("account_name")
	accountNumber := r.FormValue("account_number")

	// ===============================
	// VALIDASI WAJIB
	// ===============================

	if branchID == "" ||
		username == "" ||
		gameplayid == "" ||
		gameplaynum == "" ||
		name == "" ||
		email == "" ||
		address == "" ||
		phonenumber == "" ||
		idWallet == "" ||
		typeWallet == "" ||
		accountName == "" ||
		accountNumber == "" {

		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	// ===============================
	// Ambil file
	// ===============================

	file, header, err := r.FormFile("image_source")

	if err == nil {
		log.Println("=== REFERRAL FILE RECEIVED ===")
		log.Println("Filename:", header.Filename)
		log.Println("Size:", header.Size)
		defer file.Close()
	} else {
		log.Println("=== REFERRAL FILE NOT RECEIVED ===")
		response.Send(w, 400, "Identity file is required", nil)
		return
	}

	fields := map[string]string{
		"branch_id":      branchID,
		"username":       username,
		"gameplayid":     gameplayid,
		"gameplaynum":    gameplaynum,
		"name":           name,
		"email":          email,
		"address":        address,
		"phonenumber":    phonenumber,
		"id_wallet":      idWallet,
		"type_wallet":    typeWallet,
		"account_name":   accountName,
		"account_number": accountNumber,
	}

	log.Println("=== REFERRAL REQUEST RECEIVED ===")
	log.Println("username:", username)
	log.Println("email:", email)
	log.Println("wallet:", idWallet)

	// ===============================
	// Kirim ke upstream API
	// ===============================

	resp, err := service.PostMultipart(
		"/account/api/manage/request_refferal",
		token,
		fields,
		file,
		header.Filename,
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	log.Println("REFERRAL RESPONSE:", string(resp))

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
