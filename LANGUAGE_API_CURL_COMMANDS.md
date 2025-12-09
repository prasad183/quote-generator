# 🌐 Language API Documentation

<div align="center">

**Complete Guide to Language & Translation Endpoints**

*Ready-to-use API commands for language translation and localization*

[![API Status](https://img.shields.io/badge/API-Ready-success)](http://localhost:3000)
[![Documentation](https://img.shields.io/badge/Docs-Complete-blue)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](.)

</div>

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ API Endpoints](#-api-endpoints)
- [📖 Detailed Examples](#-detailed-examples)
- [💻 Windows PowerShell](#-windows-powershell-commands)
- [📊 Quick Reference](#-quick-reference)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

**Base URL:** `http://localhost:3000`

**Supported Languages:** `en`, `es`, `fr`, `de`, `hi`, `zh`, `te`

---

## ✨ API Endpoints

### 1. Translate Text
**POST** `/api/language/translate`

Translate text from English to a target language.

### 2. Get Available Languages
**GET** `/api/language/languages`

Get list of all supported languages with metadata.

### 3. Get UI Translations
**GET** `/api/language/translations?lang={code}`

Get all UI translations for a specific language.

---

## 📖 Detailed Examples

### 1. Translate Text

#### Basic Translation (Spanish)
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The only way to do great work is to love what you do.",
    "targetLang": "es"
  }'
```

#### Translation to Telugu
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "targetLang": "te"
  }'
```

#### Translation to Hindi
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The future belongs to those who believe in the beauty of their dreams.",
    "targetLang": "hi"
  }'
```

#### Translation to French
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Life is what happens to you while you are busy making other plans.",
    "targetLang": "fr"
  }'
```

#### Translation to German
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The way to get started is to quit talking and begin doing.",
    "targetLang": "de"
  }'
```

#### Translation to Chinese
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Don't let yesterday take up too much of today.",
    "targetLang": "zh"
  }'
```

#### English (No Translation)
```bash
curl -X POST http://localhost:3000/api/language/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "You learn more from failure than from success.",
    "targetLang": "en"
  }'
```

**Response Example:**
```json
{
  "originalText": "The only way to do great work is to love what you do.",
  "translatedText": "La única forma de hacer un gran trabajo es amar lo que haces.",
  "targetLang": "es",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Invalid language code. Supported languages: en, es, fr, de, hi, zh, te"
}
```

---

### 2. Get Available Languages

#### Get All Languages
```bash
curl -X GET http://localhost:3000/api/language/languages
```

**Response Example:**
```json
{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "nativeName": "English"
    },
    {
      "code": "es",
      "name": "Spanish",
      "nativeName": "Español"
    },
    {
      "code": "fr",
      "name": "French",
      "nativeName": "Français"
    },
    {
      "code": "de",
      "name": "German",
      "nativeName": "Deutsch"
    },
    {
      "code": "hi",
      "name": "Hindi",
      "nativeName": "हिंदी"
    },
    {
      "code": "zh",
      "name": "Chinese",
      "nativeName": "中文"
    },
    {
      "code": "te",
      "name": "Telugu",
      "nativeName": "తెలుగు"
    }
  ],
  "count": 7,
  "success": true
}
```

---

### 3. Get UI Translations

#### Get English Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=en"
```

#### Get Spanish Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=es"
```

#### Get Telugu Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=te"
```

#### Get Hindi Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=hi"
```

#### Get French Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=fr"
```

#### Get German Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=de"
```

#### Get Chinese Translations
```bash
curl -X GET "http://localhost:3000/api/language/translations?lang=zh"
```

#### Default (No lang parameter - returns English)
```bash
curl -X GET http://localhost:3000/api/language/translations
```

**Response Example:**
```json
{
  "language": "es",
  "translations": {
    "home": "Inicio",
    "search": "Buscar",
    "browse": "Explorar",
    "submit": "Enviar",
    "authors": "Autores",
    "stats": "Estadísticas",
    "favorites": "Favoritos",
    "settings": "Configuración",
    "collections": "Colecciones",
    "quoteGenerator": "💡 Generador de Citas",
    "getQuote": "Obtener Cita",
    "copy": "Copiar",
    "copied": "¡Copiado!",
    "share": "Compartir",
    "language": "Idioma",
    ...
  },
  "success": true
}
```

---

## 💻 Windows PowerShell Commands

### Translate Text (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/language/translate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text": "The only way to do great work is to love what you do.", "targetLang": "es"}'
```

### Get Available Languages (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/language/languages" -Method GET
```

### Get Translations (PowerShell)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/language/translations?lang=es" -Method GET
```

---

## 📊 Quick Reference

### Supported Language Codes

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `es` | Spanish | Español |
| `fr` | French | Français |
| `de` | German | Deutsch |
| `hi` | Hindi | हिंदी |
| `zh` | Chinese | 中文 |
| `te` | Telugu | తెలుగు |

### Request/Response Formats

#### Translate Text Request
```json
{
  "text": "string (required)",
  "targetLang": "string (required, one of: en, es, fr, de, hi, zh, te)"
}
```

#### Translate Text Response
```json
{
  "originalText": "string",
  "translatedText": "string",
  "targetLang": "string",
  "success": true
}
```

#### Get Languages Response
```json
{
  "languages": [
    {
      "code": "string",
      "name": "string",
      "nativeName": "string"
    }
  ],
  "count": number,
  "success": true
}
```

#### Get Translations Response
```json
{
  "language": "string",
  "translations": {
    "key": "value",
    ...
  },
  "success": true
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Invalid Language Code
**Error:** `Invalid language code. Supported languages: en, es, fr, de, hi, zh, te`

**Solution:** Use one of the supported language codes listed above.

#### 2. Missing Required Fields
**Error:** `Text is required and must be a string` or `Target language is required and must be a string`

**Solution:** Ensure both `text` and `targetLang` are provided in the request body.

#### 3. Translation Service Unavailable
**Error:** Translation may fail if the external translation service is unavailable.

**Solution:** The API will return the original text if translation fails.

#### 4. Server Error
**Error:** `Internal server error`

**Solution:** Check server logs and ensure the Next.js server is running.

---

## 📝 Notes

- Translation API uses MyMemory Translation Service (free tier)
- Translations are performed server-side for better performance
- If translation fails, the original text is returned
- All language codes are case-insensitive (automatically converted to lowercase)
- The translations endpoint returns UI strings for the application interface

---

## 🔗 Related Documentation

- [API CURL Commands](./API_CURL_COMMANDS.md)
- [Authentication CURL Commands](./AUTH_CURL_COMMANDS.md)
- [Postman Collection](./postman_collection.json)

---

**Last Updated:** 2024

