package model

type LaunchGameRequest struct {
	GameID            string `json:"game_id"`
	GameCode          string `json:"game_code"`
	IDMappingProvider string `json:"id_mapping_provider"`
	ProviderName      string `json:"provider_name"`
	Category          string `json:"category"`
	TypeGame          string `json:"type_game"`
}
