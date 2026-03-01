package service

import (
	"time"

	"slot-backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	Name        string `json:"name"`
	NameUnique  string `json:"name_unique"`
	Email       string `json:"email"`
	Phonenumber string `json:"phonenumber"`
	Username    string `json:"username"`
	BranchID    string `json:"branch_id"`
	Token       string `json:"token"`
	GameplayID  string `json:"gameplayid"`
	GameplayNum string `json:"gameplaynum"`
	ClientIP    string `json:"client_ip"`
	jwt.RegisteredClaims
}

func GenerateJWT(name, name_unique, email, phonenumber, username, branchID, token, gameplayID, gameplayNum, client_ip string) (string, error) {

	claims := JWTClaims{
		Name:        name,
		NameUnique:  name_unique,
		Email:       email,
		Phonenumber: phonenumber,
		Username:    username,
		BranchID:    branchID,
		Token:       token,
		GameplayID:  gameplayID,
		GameplayNum: gameplayNum,
		ClientIP:    client_ip,
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
