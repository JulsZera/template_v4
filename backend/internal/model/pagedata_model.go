package model

type PageDataResponse struct {
	RCode   string `json:"rcode"`
	Message string `json:"message"`

	DataSEO                interface{} `json:"data_seo"`
	DataCanonical          interface{} `json:"data_canonical"`
	DataBranch             interface{} `json:"data_branch"`
	DataBanner             interface{} `json:"data_banner"`
	DataCategory           interface{} `json:"data_category"`
	DataLastPlay           interface{} `json:"data_lastplay"`
	DataMostPlay           interface{} `json:"data_mostplay"`
	DataPopup              interface{} `json:"data_popup"`
	DataProvider           interface{} `json:"data_provider"`
	DataBankStatus         interface{} `json:"data_bankstatus"`
	DataProviderPGA        interface{} `json:"data_providerpga"`
	DataContactInformation interface{} `json:"data_contactinformation"`

	JackpotAmount string `json:"jackpot_amount"`
	RedirectAMP   string `json:"redirect_amp"`
}
