package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func main() {

	bytes := make([]byte, 32)

	rand.Read(bytes)

	fmt.Println(hex.EncodeToString(bytes))
}
