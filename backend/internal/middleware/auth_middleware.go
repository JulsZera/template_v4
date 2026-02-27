package middleware

import (
	"context"
	"net/http"
	"strings"

	"slot-backend/internal/service"
)

type contextKey string

const UserContextKey contextKey = "user"

func JWTMiddleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {

			w.WriteHeader(401)
			w.Write([]byte("Missing token"))
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		claims, err := service.ValidateJWT(tokenString)

		if err != nil {

			w.WriteHeader(401)
			w.Write([]byte("Invalid token"))
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
