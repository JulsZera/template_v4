package cache

import (
	"log"
	"time"

	"slot-backend/internal/config"
	"slot-backend/internal/service"
)

func StartCacheWarmer() {

	go func() {

		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for range ticker.C {

			data, err := service.Post(
				"/account/api/content/pagedata",
				map[string]string{
					"branch_id": config.BRANCH_ID,
				},
				"",
			)

			if err != nil {

				log.Println("Cache warmer error:", err)
				continue
			}

			SetPageData(data)

			log.Println("Cache warmed successfully")
		}

	}()
}
