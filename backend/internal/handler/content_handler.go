package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"slot-backend/internal/cache"
	"slot-backend/internal/config"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"

	"golang.org/x/sync/singleflight"
)

var pagedataGroup singleflight.Group
var refreshLock sync.Mutex

var providerGroup singleflight.Group
var gameListGroup singleflight.Group

func GetPageDataHandler(w http.ResponseWriter, r *http.Request) {

	start := time.Now()

	v, _, _ := pagedataGroup.Do("pagedata", func() (interface{}, error) {

		cached, fresh := cache.GetPageData()

		if cached != nil {

			// refresh background jika expired
			if !fresh {
				go refreshPageData()
			}

			return cached, nil
		}

		// first load
		refreshPageData()

		cached, _ = cache.GetPageData()

		if cached != nil {
			return cached, nil
		}

		return nil, nil
	})

	if v == nil {
		http.Error(w, "Failed load pagedata", 500)
		return
	}

	data := v.([]byte)

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)

	log.Println("Pagedata served in", time.Since(start))
}

func refreshPageData() {

	refreshLock.Lock()
	defer refreshLock.Unlock()

	log.Println("Refreshing pagedata from API...")

	data, err := service.Post(
		"/account/api/content/pagedata",
		map[string]string{
			"branch_id": config.BRANCH_ID,
		},
		"",
	)

	if err != nil {

		log.Println("Failed refresh pagedata:", err)
		return
	}

	cache.SetPageData(data)

	log.Println("Pagedata cache updated successfully")
}

func GetDataProviderHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	category := payload["category"].(string)

	v, _, _ := providerGroup.Do(category, func() (interface{}, error) {

		cached, fresh := cache.GetProviders(category)

		if cached != nil {

			if !fresh {
				go refreshProvider(category, payload)
			}

			return cached, nil
		}

		refreshProvider(category, payload)

		cached, _ = cache.GetProviders(category)

		return cached, nil
	})

	if v == nil {
		http.Error(w, "Failed load provider", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(v.([]byte))
}

func refreshProvider(category string, payload map[string]interface{}) {

	log.Println("Refreshing provider:", category)

	data, err := service.Post(
		"/account/api/content/getdata_provider",
		payload,
		"",
	)

	if err != nil {

		log.Println("Failed refresh provider:", err)
		return
	}

	cache.SetProviders(category, data)

	log.Println("Provider cache updated:", category)
}

func GetDataListGameHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	category := payload["category"].(string)
	provider := payload["provider_name"].(string)
	filter := payload["filter"].(string)

	key := category + "_" + provider + "_" + filter

	v, _, _ := gameListGroup.Do(key, func() (interface{}, error) {

		cached, fresh := cache.GetGameList(key)

		if cached != nil {

			if !fresh {
				go refreshGameList(key, payload)
			}

			return cached, nil
		}

		refreshGameList(key, payload)

		cached, _ = cache.GetGameList(key)

		return cached, nil
	})

	if v == nil {
		http.Error(w, "Failed load gamelist", 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(v.([]byte))
}

func refreshGameList(key string, payload map[string]interface{}) {

	log.Println("Refreshing gamelist:", key)

	data, err := service.Post(
		"/account/api/content/getdata_listgame",
		payload,
		"",
	)

	if err != nil {

		log.Println("Failed refresh gamelist:", err)
		return
	}

	cache.SetGameList(key, data)

	log.Println("Gamelist cache updated:", key)
}

func GetCacheVersionHandler(w http.ResponseWriter, r *http.Request) {

	resp := map[string]int64{
		"pagedata": cache.GetPageDataVersion(),
		"provider": cache.GetProvidersGlobalVersion(),
		"gamelist": cache.GetGameListGlobalVersion(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func GetSeoPageHandler(w http.ResponseWriter, r *http.Request) {

	var req model.SeoPageRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request body", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id":   config.BRANCH_ID,
		"page_url":    req.PageUrl,
		"domain_name": req.DomainName,
	}

	log.Println("BRANCH ID :", config.BRANCH_ID)
	log.Println("PAGE URL :", req.PageUrl)
	log.Println("DOMAIN NAME :", req.DomainName)

	if config.BRANCH_ID == "" || req.PageUrl == "" || req.DomainName == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	resp, err := service.Post(
		"/account/api/content/seo_single",
		payload,
		"",
	)

	if err != nil {
		response.Send(w, 500, err.Error(), nil)
		return
	}

	var result map[string]interface{}
	json.Unmarshal(resp, &result)

	rcode, _ := result["rcode"].(string)
	message, _ := result["message"].(string)

	log.Println("RCODE :", rcode)
	log.Println("MESSAGE :", message)

	if rcode != "00" {
		response.Send(w, 400, message, result)
		return
	}

	response.Send(w, 200, message, result)
}

func GetDataCategoryHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := service.Post(
		"/account/api/content/getdata_category",
		payload,
		"",
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func GetDataStatusPageHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := service.Post(
		"/account/api/content/check_statuspage",
		payload,
		"",
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}
