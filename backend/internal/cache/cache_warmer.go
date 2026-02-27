package cache

import (
	"log"
	"time"

	"slot-backend/internal/service"
)

func StartCacheWarmer() {

	go func() {

		for {

			time.Sleep(30 * time.Second)

			data, err := service.Post(
				"/account/api/content/pagedata",
				map[string]string{
					"branch_id": "GGCULOX",
				},
				"",
			)

			if err == nil {

				SetPageData(data)

				log.Println("Cache warmed")

			}

		}

	}()
}
