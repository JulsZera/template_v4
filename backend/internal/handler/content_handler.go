package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"slot-backend/internal/cache"
	"slot-backend/internal/service"
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
