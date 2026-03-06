package handler

import (
	"net/http"
	"slot-backend/internal/cache"
)

func SeoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write(cache.GetSEO())
}

func CanonicalHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetCanonical())
}

func BranchHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetBranch())
}

func BannerHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetBanner())
}

func CategoryHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetCategory())
}

func LastPlayHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetLastPlay())
}

func MostPlayHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetMostPlay())
}

func PopupHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetPopup())
}

func ProviderHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetProvider())
}

func BankHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetBank())
}

func ProviderPGAHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetProviderPGA())
}

func ContactHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetContact())
}

func JackpotHandler(w http.ResponseWriter, r *http.Request) {
	w.Write(cache.GetJackpot())
}
