package model

type DepositRequest struct {
	BranchID    string `json:"branch_id"`
	Username    string `json:"username"`
	GameplayID  string `json:"gameplayid"`
	GameplayNum string `json:"gameplaynum"`
	Wallet      string `json:"wallet"`
	WalletAdmin string `json:"wallet_admin"`
	Bonus       string `json:"bonus"`
	Amount      string `json:"amount"`
	Description string `json:"description"`
}

type WithdrawRequest struct {
	WalletUser  string `json:"wallet_user"`
	Amount      string `json:"amount"`
	Description string `json:"description"`
}

type AddBankRequest struct {
	Email         string `json:"email"`
	TypeWallet    string `json:"type_wallet"`
	IDWallet      string `json:"id_wallet"`
	AccountName   string `json:"account_name"`
	AccountNumber string `json:"account_number"`
}

type ReferralRequest struct {
	Email         string `json:"email"`
	Address       string `json:"address"`
	PhoneNumber   string `json:"phonenumber"`
	IDWallet      string `json:"id_wallet"`
	TypeWallet    string `json:"type_wallet"`
	AccountName   string `json:"account_name"`
	AccountNumber string `json:"account_number"`
}

type UpdatePopupRequest struct {
	TxID            string `json:"txid"`
	TransactionType string `json:"transaction_type"`
	FlagPopup       string `json:"flag_popup"`
}
