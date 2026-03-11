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
		BranchID:    config.BRANCH_ID,
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
		BranchID:    config.BRANCH_ID,
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

	var req model.HistoryRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id":  config.BRANCH_ID,
		"username":   claims.Username,
		"start_date": req.StartDate,
		"end_date":   req.EndDate,
		"type":       req.Type,
	}

	resp, err := service.Post(
		"/account/api/data/history_transaction",
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
		"branch_id":   config.BRANCH_ID,
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

	payload := map[string]interface{}{
		"branch_id":   config.BRANCH_ID,
		"username":    claims.Username,
		"gameplayid":  claims.GameplayID,
		"gameplaynum": claims.GameplayNum,
	}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		response.Send(w, 400, "Invalid request", nil)
		return
	}

	if config.BRANCH_ID == "" || claims.Username == "" ||
		claims.GameplayID == "" || claims.GameplayNum == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/manage/check_request_refferal",
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

	response.Send(w, 200, "Success", result)
}

func TurnoverHandler(w http.ResponseWriter, r *http.Request) {

	claims, ok := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	if !ok {
		response.Send(w, 401, "Unauthorized", nil)
		return
	}

	token := claims.Token

	var req model.TurnoverRequest

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
		"category":    req.Category,
		"provider":    req.Provider,
		"start_date":  req.StartDate,
		"end_date":    req.EndDate,
	}

	log.Println("=== TURNOVER REQUEST ===")
	log.Println("branch_id:", config.BRANCH_ID)
	log.Println("username:", claims.Username)
	log.Println("gameplayid:", claims.GameplayID)
	log.Println("gameplaynum:", claims.GameplayNum)
	log.Println("category:", req.Category)
	log.Println("provider:", req.Provider)
	log.Println("startdate:", req.StartDate)
	log.Println("enddate:", req.EndDate)

	resp, err := service.Post(
		"/account/api/data/turnover",
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
