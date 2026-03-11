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
	r.Use(middleware.RateLimiter)
	r.Use(cors.Handler(cors.Options{

		AllowedOrigins: []string{
			"http://localhost:5172",
			"http://127.0.0.1:5172",
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:5174",
			"http://127.0.0.1:5174",
			"https://demogacor.demogg.site",
			"https://www.demogacor.demogg.site",
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

	r.Route("/zera", func(r chi.Router) {

		r.Post("/login", handler.LoginHandler)
		r.Post("/register", handler.RegisterHandler)
		// GAME
		r.Post("/pagedata", handler.GetPageDataHandler)
		r.Post("/cache/version", handler.GetCacheVersionHandler)
		r.Post("/gamelist", handler.GetDataListGameHandler)
		r.Post("/provider", handler.GetDataProviderHandler)
		r.Post("/listbank", handler.ListBankPublicHandler)
		r.Post("/seo-page", handler.GetSeoPageHandler)
		r.Post("/categories", handler.GetDataCategoryHandler)
		r.Post("/check-page", handler.GetDataStatusPageHandler)

		// PAGEDATA PARSED
		r.Post("/pagedata/seo", handler.SeoHandler)
		r.Post("/pagedata/canonical", handler.CanonicalHandler)
		r.Post("/pagedata/branch", handler.BranchHandler)
		r.Post("/pagedata/banner", handler.BannerHandler)
		r.Post("/pagedata/category", handler.CategoryHandler)
		r.Post("/pagedata/lastplay", handler.LastPlayHandler)
		r.Post("/pagedata/mostplay", handler.MostPlayHandler)
		r.Post("/pagedata/popup", handler.PopupHandler)
		r.Post("/pagedata/provider", handler.ProviderHandler)
		r.Post("/pagedata/bank", handler.BankHandler)
		r.Post("/pagedata/providerpga", handler.ProviderPGAHandler)
		r.Post("/pagedata/contact", handler.ContactHandler)
		r.Post("/pagedata/jackpot", handler.JackpotHandler)

		log.Println("Route /zera/pagedata registered")

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
			r.Post("/launchprovider", handler.LaunchProviderHandler)

		})

	})

	go func() {

		log.Println("Preloading pagedata cache...")

		data, err := service.Post(
			"/account/api/content/pagedata",
			map[string]string{
				"branch_id": config.BRANCH_ID,
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
