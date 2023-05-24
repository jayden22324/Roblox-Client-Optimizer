package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// Check if index.js exists in the current directory
	_, err = os.Stat(filepath.Join(dir, "index.js"))
	if os.IsNotExist(err) {
		// Download index.js from URL
		url := "https://roblox-client-optimizer.simulhost.com/RCO-JS/index.js"
		resp, err := http.Get(url)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer resp.Body.Close()

		// Create index.js file
		out, err := os.Create(filepath.Join(dir, "index.js"))
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		defer out.Close()

		// Write the body to file
		_, err = io.Copy(out, resp.Body)
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
	}

	cmd := exec.Command("node", filepath.Join(dir, "index.js"))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
