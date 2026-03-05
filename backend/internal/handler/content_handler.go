package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"slot-backend/internal/cache"
	"slot-backend/internal/config"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func GetPageDataHandler(w http.ResponseWriter, r *http.Request) {

	start := time.Now()

	// cek cache
	cached, fresh := cache.GetPageData()

	if cached != nil {

		w.Header().Set("Content-Type", "application/json")
		w.Write(cached)

		log.Println("Pagedata served from cache in", time.Since(start))

		// refresh background jika expired
		if !fresh {
			go refreshPageData()
		}

		return
	}

	// first load
	refreshPageData()

	cached, _ = cache.GetPageData()

	if cached != nil {

		w.Header().Set("Content-Type", "application/json")
		w.Write(cached)

		log.Println("Pagedata served after refresh in", time.Since(start))

		return
	}

	http.Error(w, "Failed load pagedata", 500)
}

func refreshPageData() {

	log.Println("Refreshing pagedata from API...")

	data, err := service.Post(
		"/account/api/content/pagedata",
		map[string]string{
			"branch_id": "GGCULOX",
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

func GetDataListGameHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := service.Post(
		"/account/api/content/getdata_listgame",
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

func GetDataProviderHandler(w http.ResponseWriter, r *http.Request) {

	var payload map[string]interface{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := service.Post(
		"/account/api/content/getdata_provider",
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
