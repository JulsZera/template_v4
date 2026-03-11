package cache

import (
	"encoding/json"
	"sync"
	"time"

	"slot-backend/internal/model"
)

type PageDataCache struct {
	RawData   []byte
	Version   int64
	UpdatedAt time.Time
	mutex     sync.RWMutex

	SeoCache         []byte
	CanonicalCache   []byte
	BranchCache      []byte
	BannerCache      []byte
	CategoryCache    []byte
	LastPlayCache    []byte
	MostPlayCache    []byte
	PopupCache       []byte
	ProviderCache    []byte
	BankCache        []byte
	ProviderPGACache []byte
	ContactCache     []byte
	JackpotCache     []byte
	RedirectAMPCache []byte
}

var pageDataCache = &PageDataCache{}

var CacheTTL = 10 * time.Second

func GetPageData() ([]byte, bool) {

	pageDataCache.mutex.RLock()
	defer pageDataCache.mutex.RUnlock()

	if pageDataCache.RawData == nil {
		return nil, false
	}

	fresh := time.Since(pageDataCache.UpdatedAt) < CacheTTL

	return pageDataCache.RawData, fresh
}

func GetPageDataVersion() int64 {

	pageDataCache.mutex.RLock()
	defer pageDataCache.mutex.RUnlock()

	return pageDataCache.Version
}

func SetPageData(data []byte) {

	var parsed model.PageDataResponse
	json.Unmarshal(data, &parsed)

	seo, _ := json.Marshal(parsed.DataSEO)
	canonical, _ := json.Marshal(parsed.DataCanonical)
	branch, _ := json.Marshal(parsed.DataBranch)
	banner, _ := json.Marshal(parsed.DataBanner)
	category, _ := json.Marshal(parsed.DataCategory)
	lastplay, _ := json.Marshal(parsed.DataLastPlay)
	mostplay, _ := json.Marshal(parsed.DataMostPlay)
	popup, _ := json.Marshal(parsed.DataPopup)
	provider, _ := json.Marshal(parsed.DataProvider)
	bank, _ := json.Marshal(parsed.DataBankStatus)
	providerpga, _ := json.Marshal(parsed.DataProviderPGA)
	contact, _ := json.Marshal(parsed.DataContactInformation)
	jackpot, _ := json.Marshal(map[string]string{
		"jackpot_amount": parsed.JackpotAmount,
	})
	redirectamp, _ := json.Marshal(map[string]string{
		"jackpot_amount": parsed.RedirectAMP,
	})

	pageDataCache.mutex.Lock()
	defer pageDataCache.mutex.Unlock()

	pageDataCache.RawData = data

	pageDataCache.SeoCache = seo
	pageDataCache.CanonicalCache = canonical
	pageDataCache.BranchCache = branch
	pageDataCache.BannerCache = banner
	pageDataCache.CategoryCache = category
	pageDataCache.LastPlayCache = lastplay
	pageDataCache.MostPlayCache = mostplay
	pageDataCache.PopupCache = popup
	pageDataCache.ProviderCache = provider
	pageDataCache.BankCache = bank
	pageDataCache.ProviderPGACache = providerpga
	pageDataCache.ContactCache = contact
	pageDataCache.JackpotCache = jackpot
	pageDataCache.RedirectAMPCache = redirectamp

	pageDataCache.Version = time.Now().Unix()
	pageDataCache.UpdatedAt = time.Now()
}

func GetSEO() []byte         { return pageDataCache.SeoCache }
func GetCanonical() []byte   { return pageDataCache.CanonicalCache }
func GetBranch() []byte      { return pageDataCache.BranchCache }
func GetBanner() []byte      { return pageDataCache.BannerCache }
func GetCategory() []byte    { return pageDataCache.CategoryCache }
func GetLastPlay() []byte    { return pageDataCache.LastPlayCache }
func GetMostPlay() []byte    { return pageDataCache.MostPlayCache }
func GetPopup() []byte       { return pageDataCache.PopupCache }
func GetProvider() []byte    { return pageDataCache.ProviderCache }
func GetBank() []byte        { return pageDataCache.BankCache }
func GetProviderPGA() []byte { return pageDataCache.ProviderPGACache }
func GetContact() []byte     { return pageDataCache.ContactCache }
func GetJackpot() []byte     { return pageDataCache.JackpotCache }
func GetRedirectAMP() []byte { return pageDataCache.RedirectAMPCache }
