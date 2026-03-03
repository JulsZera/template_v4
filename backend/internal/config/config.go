package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var LISTEN_ADDR string
var API_BASE_URL string
var CLIENT_API_KEY string
var JWT_SECRET string
var BRANCH_ID string
var DOMAIN string
var DOMAIN_BANKING string

func LoadEnv() {

	JWT_SECRET = getEnv("JWT_SECRET", "")

	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}

	LISTEN_ADDR = getEnv("LISTEN_ADDR", "")
	API_BASE_URL = getEnv("API_BASE_URL", "")
	CLIENT_API_KEY = getEnv("CLIENT_API_KEY", "")
	BRANCH_ID = getEnv("BRANCH_ID", "")
	DOMAIN = getEnv("DOMAIN", "")
	DOMAIN_BANKING = getEnv("DOMAIN_BANKING", "")
}

func getEnv(key string, fallback string) string {

	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
