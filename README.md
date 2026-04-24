# AngelMate Starter Backend

Ein modernes Starterprojekt für eine Angel-App mit:
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT Auth
- Fangbuch (Catches)
- Angelspots (Spots)
- Stats Endpoint
- einfacher Forecast/Bissindex Endpoint

## Features
- Registrierung und Login
- geschützte API per Bearer Token
- Fangbuch CRUD
- Spot CRUD
- persönliche Statistik
- einfacher Bissindex basierend auf Wetter-/Tageszeit-Heuristik

## Schnellstart

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Environment anlegen
```bash
cp .env.example .env
```

### 3. PostgreSQL starten und DB URL anpassen
Passe `DATABASE_URL` in `.env` an.

### 4. Prisma Client generieren
```bash
npm run prisma:generate
```

### 5. Migration ausführen
```bash
npm run prisma:migrate -- --name init
```

### 6. Optional Seed-Daten laden
```bash
npm run db:seed
```

### 7. App starten
```bash
npm run dev
```

Server läuft dann standardmäßig unter:
`http://localhost:3000`

## API Übersicht

### Health
- `GET /health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Catches
- `GET /api/catches`
- `POST /api/catches`
- `GET /api/catches/:id`
- `PUT /api/catches/:id`
- `DELETE /api/catches/:id`

### Spots
- `GET /api/spots`
- `POST /api/spots`
- `GET /api/spots/:id`
- `PUT /api/spots/:id`
- `DELETE /api/spots/:id`

### Stats
- `GET /api/stats/overview`

### Forecast
- `GET /api/forecast/today?temperature=14&pressure=1017&windSpeed=10&cloudCover=35`

## Beispiel Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max@example.com",
    "password": "password123"
  }'
```

## Nächste sinnvolle Ausbaustufen
- Bild-Upload via S3/Cloudinary
- Geo-Suche mit PostGIS
- Wetter-Integration mit externer API
- Community Feed
- Likes, Kommentare, Challenges
- Push Notifications
