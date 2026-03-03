package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"

	"slot-backend/internal/cache"
	"slot-backend/internal/config"
	"slot-backend/internal/handler"
	"slot-backend/internal/middleware"
	"slot-backend/internal/service"
)

func main() {

	config.LoadEnv()

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{

		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		},

		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},

		AllowedHeaders: []string{
			"*",
		},

		AllowCredentials: true,
	}))

	r.Route("/vite", func(r chi.Router) {

		r.Post("/login", handler.LoginHandler)
		r.Post("/register", handler.RegisterHandler)
		// GAME
		r.Post("/pagedata", handler.GetPageDataHandler)
		r.Post("/gamelist", handler.GetDataListGameHandler)
		r.Post("/provider", handler.GetDataProviderHandler)
		r.Post("/listbank", handler.ListBankPublicHandler)

		log.Println("Route /vite/pagedata registered")

		r.Group(func(r chi.Router) {

			r.Use(middleware.JWTMiddleware)

			// USER
			r.Post("/profile", handler.GetProfileHandler)
			r.Post("/balance", handler.GetBalanceHandler)
			r.Post("/check-wallet", handler.CheckWalletHandler)
			r.Post("/add-bank", handler.AddBankHandler)
			r.Post("/check-request-reff", handler.CheckRequestRefferalHandler)
			r.Post("/referral", handler.ReferralHandler)
			r.Post("/request-reff", handler.RequestReferralHandler)
			r.Post("/change-password", handler.ChangePasswordHandler)
			r.Post("/check-wallet-user", handler.CheckWalletUserHandler)
			r.Post("/update-popup-transaction", handler.UpdatePopupTransactionHandler)
			r.Post("/turnover", handler.TurnoverHandler)

			// TRANSACTION
			r.Post("/deposit", handler.DepositHandler)
			r.Post("/withdraw", handler.WithdrawHandler)
			r.Post("/history", handler.GetHistoryHandler)
			r.Post("/get-promotion", handler.GetPromotionHandler)
			r.Post("/get-promotion-user", handler.GetPromotionDepositHandler)

			// LAUNCHGAME
			r.Post("/launchgame", handler.LaunchGameHandler)

		})

	})

	go func() {

		log.Println("Preloading pagedata cache...")

		data, err := service.Post(
			"/account/api/content/pagedata",
			map[string]string{
				"branch_id": "GGCULOX",
			},
			"",
		)

		if err == nil {

			cache.SetPageData(data)

			log.Println("Pagedata cache preloaded")

		}

	}()
	cache.StartCacheWarmer()

	addr := config.LISTEN_ADDR
	log.Println("Service running on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}
