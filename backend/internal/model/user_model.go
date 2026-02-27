package model

type ProfileRequest struct {
	BranchID    string `json:"branch_id"`
	Username    string `json:"username"`
	GameplayID  string `json:"gameplayid"`
	GameplayNum string `json:"gameplaynum"`
	Function    string `json:"function"`
}

type BalanceRequest struct {
	BranchID    string `json:"branch_id"`
	Username    string `json:"username"`
	GameplayID  string `json:"gameplayid"`
	GameplayNum string `json:"gameplaynum"`
}

type ProviderRequest struct {
	BranchID string `json:"branch_id"`
	Category string `json:"category"`
}

type WalletRequest struct {
	BranchID string `json:"branch_id"`
	Username string `json:"username"`
}

type HistoryRequest struct {
	BranchID  string `json:"branch_id"`
	Username  string `json:"username"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	Type      string `json:"type"`
}
