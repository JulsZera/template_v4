package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"slot-backend/internal/config"
	"slot-backend/internal/middleware"
	"slot-backend/internal/model"
	"slot-backend/internal/service"
	"slot-backend/pkg/response"
)

func LaunchGameHandler(w http.ResponseWriter, r *http.Request) {

	claims := r.Context().Value(middleware.UserContextKey).(*service.JWTClaims)
	token := claims.Token

	var req model.LaunchGameRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		response.Send(w, 400, "Invalid request body", nil)
		return
	}

	payload := map[string]interface{}{
		"branch_id":           config.BRANCH_ID,
		"realname":            claims.Name,
		"name":                claims.NameUnique,
		"email":               claims.Email,
		"phonenumber":         claims.Phonenumber,
		"username":            claims.Username,
		"gameplayid":          claims.GameplayID,
		"gameplaynum":         claims.GameplayNum,
		"game_id":             req.GameID,
		"game_code":           req.GameCode,
		"id_mapping_provider": req.IDMappingProvider,
		"provider_name":       req.ProviderName,
		"category":            req.Category,
		"type_game":           req.TypeGame,
		"client_ip":           claims.ClientIP,
		"lobbyurl":            config.DOMAIN,
		"casierurl":           config.DOMAIN_BANKING,
	}

	log.Println("BRANCH ID :", config.BRANCH_ID)
	log.Println("NAME :", claims.Name)
	log.Println("NAME UNIQUE :", claims.NameUnique)
	log.Println("EMAIL :", claims.Email)
	log.Println("PHONE :", claims.Phonenumber)
	log.Println("USERNAME :", claims.Username)
	log.Println("GAMEPLAYID :", claims.GameplayID)
	log.Println("GAMEPLAYNUM :", claims.GameplayNum)
	log.Println("GAMEID :", req.GameID)
	log.Println("GAMECODE :", req.GameCode)
	log.Println("IDMP :", req.IDMappingProvider)
	log.Println("PROVIDER NAME :", req.ProviderName)
	log.Println("CATEGORY :", req.Category)
	log.Println("TYPE GAME :", req.TypeGame)
	log.Println("CLIENT IP :", claims.ClientIP)
	log.Println("DOMAIN :", config.DOMAIN)
	log.Println("DOMAIN BANK :", config.DOMAIN_BANKING)

	if claims.BranchID == "" || claims.Username == "" {
		response.Send(w, 400, "Missing required fields", nil)
		return
	}

	if req.GameID == "" || req.IDMappingProvider == "" {
		response.Send(w, 400, "Invalid game data", nil)
		return
	}

	var endpoint string

	if req.ProviderName == "pgsoft" {
		endpoint = "/account/api/games/getlink_html"
	} else {
		endpoint = "/account/api/games/getlink_url"
	}

	log.Println("END POINT", config.API_BASE_URL+endpoint)

	resp, err := service.Post(
		endpoint,
		payload,
		token,
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
