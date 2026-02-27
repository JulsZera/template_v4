package service

import (
	"time"

	"slot-backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	Username    string `json:"username"`
	BranchID    string `json:"branch_id"`
	Token       string `json:"token"`
	GameplayID  string `json:"gameplayid"`
	GameplayNum string `json:"gameplaynum"`
	jwt.RegisteredClaims
}

func GenerateJWT(username, branchID, token, gameplayID, gameplayNum string) (string, error) {

	claims := JWTClaims{
		Username:    username,
		BranchID:    branchID,
		Token:       token,
		GameplayID:  gameplayID,
		GameplayNum: gameplayNum,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return jwtToken.SignedString([]byte(config.JWT_SECRET))
}

func ValidateJWT(tokenString string) (*JWTClaims, error) {

	token, err := jwt.ParseWithClaims(
		tokenString,
		&JWTClaims{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(config.JWT_SECRET), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims := token.Claims.(*JWTClaims)

	return claims, nil
}
