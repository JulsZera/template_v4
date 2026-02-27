package service

import (
	"bytes"
	"io"
	"log"
	"mime/multipart"
	"net/http"

	"slot-backend/internal/config"
)

func PostMultipart(endpoint string, token string, fields map[string]string, file multipart.File, filename string) ([]byte, error) {

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Text fields
	for key, val := range fields {
		writer.WriteField(key, val)
	}

	// File
	part, err := writer.CreateFormFile("image_source", filename)
	if err != nil {
		return nil, err
	}

	file.Seek(0, io.SeekStart)

	written, err := io.Copy(part, file)
	if err != nil {
		return nil, err
	}

	log.Println("=== FILE SENT TO EXTERNAL ===")
	log.Println("Filename:", filename)
	log.Println("Bytes written:", written)

	writer.Close()

	req, err := http.NewRequest("POST", config.API_BASE_URL+endpoint, &requestBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Client-API-Key", config.CLIENT_API_KEY)
	req.Header.Set("X-Token", token)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	bodyBytes, _ := io.ReadAll(res.Body)

	log.Println("=== EXTERNAL STATUS CODE ===", res.StatusCode)
	log.Println("=== EXTERNAL RESPONSE BODY ===", string(bodyBytes))

	return bodyBytes, nil
}

func PostMultipartNoFile(endpoint string, token string, fields map[string]string) ([]byte, error) {

	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	for key, val := range fields {
		writer.WriteField(key, val)
	}

	writer.Close()

	req, err := http.NewRequest("POST", config.API_BASE_URL+endpoint, &requestBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("X-Client-API-Key", config.CLIENT_API_KEY)
	req.Header.Set("X-Token", token)

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	return io.ReadAll(res.Body)
}
