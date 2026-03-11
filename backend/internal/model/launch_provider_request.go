package model

type LaunchProviderRequest struct {
	ApiGameURL        string `json:"apigame_url"`
	IDMappingProvider string `json:"id_mapping_provider"`
	ProviderName      string `json:"provider_name"`
	Category          string `json:"category"`
	TypeGame          string `json:"type_game"`
}
