package response

import (
	"encoding/json"
	"net/http"
)

type JSONResponse struct {
	Status  bool        `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func Send(w http.ResponseWriter, code int, message string, data interface{}) {

	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(code)

	json.NewEncoder(w).Encode(JSONResponse{
		Status:  code < 400,
		Message: message,
		Data:    data,
	})
}
