---
title: "SQLite File Encryption with GPG"
date: 2025-12-05T08:14:36-06:00
draft: false
tags:
- go
---

SQLite is a single-file database that requires no server or daemon. Combined with GPG encryption, it provides a secure way to store and retrieve sensitive data in Go applications.

## Basic SQLite Usage

SQLite operates on a single file. Opening a database creates the file if it doesn't exist:

```go
package main

import (
    "database/sql"
    "log"

    _ "github.com/mattn/go-sqlite3"
)

func main() {
    // Opens or creates config.db in the current directory
    db, err := sql.Open("sqlite3", "./config.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Create table
    db.Exec(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )`)

    // Store a value
    db.Exec("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
        "session.profile", "my-profile")

    // Retrieve a value
    var value string
    db.QueryRow("SELECT value FROM config WHERE key = ?",
        "session.profile").Scan(&value)
    log.Println("Profile:", value)
}
```

## Adding GPG Encryption

To encrypt data before storing it in SQLite, use the ProtonMail OpenPGP library:

```go
package main

import (
    "bytes"
    "database/sql"
    "io"
    "log"

    "github.com/ProtonMail/go-crypto/openpgp"
    _ "github.com/mattn/go-sqlite3"
)

type SecureDB struct {
    db        *sql.DB
    publicKey *openpgp.Entity
    secretKey *openpgp.Entity
}

func NewSecureDB(dbPath, keyringPath string) (*SecureDB, error) {
    // Open database
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, err
    }

    // Create table
    _, err = db.Exec(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value BLOB
    )`)
    if err != nil {
        return nil, err
    }

    // Load GPG keyring
    keyringFile, err := os.Open(keyringPath)
    if err != nil {
        return nil, err
    }
    defer keyringFile.Close()

    entityList, err := openpgp.ReadArmoredKeyRing(keyringFile)
    if err != nil {
        return nil, err
    }

    return &SecureDB{
        db:        db,
        publicKey: entityList[0],
        secretKey: entityList[0],
    }, nil
}

// Encrypt data with GPG
func (s *SecureDB) encrypt(plaintext []byte) ([]byte, error) {
    buf := new(bytes.Buffer)
    w, err := openpgp.Encrypt(buf, []*openpgp.Entity{s.publicKey},
        nil, nil, nil)
    if err != nil {
        return nil, err
    }

    _, err = w.Write(plaintext)
    if err != nil {
        return nil, err
    }
    w.Close()

    return buf.Bytes(), nil
}

// Decrypt GPG-encrypted data
func (s *SecureDB) decrypt(ciphertext []byte) ([]byte, error) {
    md, err := openpgp.ReadMessage(bytes.NewReader(ciphertext),
        openpgp.EntityList{s.secretKey}, nil, nil)
    if err != nil {
        return nil, err
    }

    return io.ReadAll(md.UnverifiedBody)
}

// Store encrypted value
func (s *SecureDB) Set(key, value string) error {
    encrypted, err := s.encrypt([]byte(value))
    if err != nil {
        return err
    }

    _, err = s.db.Exec(
        "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)",
        key, encrypted)
    return err
}

// Retrieve and decrypt value
func (s *SecureDB) Get(key string) (string, error) {
    var encrypted []byte
    err := s.db.QueryRow(
        "SELECT value FROM config WHERE key = ?", key).Scan(&encrypted)
    if err != nil {
        return "", err
    }

    decrypted, err := s.decrypt(encrypted)
    if err != nil {
        return "", err
    }

    return string(decrypted), nil
}

func (s *SecureDB) Close() error {
    return s.db.Close()
}
```

## Usage Example

```go
func main() {
    db, err := NewSecureDB("./config.db", "./keyring.asc")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Store encrypted data
    db.Set("session.token", "secret-token-value")

    // Retrieve and decrypt data
    token, err := db.Get("session.token")
    if err != nil {
        log.Fatal(err)
    }

    log.Println("Token:", token)
}
```

## Installation

```bash
go get github.com/mattn/go-sqlite3
go get github.com/ProtonMail/go-crypto/openpgp
```

## Key Benefits

- **No server required**: SQLite is just a file, making it simple to deploy
- **GPG compatibility**: Data can be decrypted with standard GPG tools
- **Selective encryption**: Encrypt only sensitive values, not the entire database
- **Concurrent access**: SQLite handles multiple readers safely with transactions
