package model

type LoginRequest struct {
	BranchID string `json:"branch_id"`
	Username string `json:"username"`
	Password string `json:"password"`
	ClientIP string `json:"client_ip"`
}

type RegisterRequest struct {
	BranchID      string `json:"branch_id"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	Email         string `json:"email"`
	PhoneNumber   string `json:"phonenumber"`
	Refferal      string `json:"refferal"`
	TypeWallet    string `json:"type_wallet"`
	IDWallet      string `json:"id_wallet"`
	AccountName   string `json:"account_name"`
	AccountNumber string `json:"account_number"`
	ClientIP      string `json:"client_ip"`
}
