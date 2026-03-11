package model

type CheckWalletUser struct {
	BranchID        string `json:"branch_id"`
	Username        string `json:"username"`
	TypeTransaction string `json:"transaction_type"`
	TierID          string `json:"id_tier"`
	TypeWallet      string `json:"type_wallet"`
}
