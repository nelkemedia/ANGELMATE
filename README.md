# AngelMate — Full-Stack Angelbegleiter PWA

Eine moderne Progressive Web App für Angler mit Fangbuch, Community-Features, Wettervorhersage und KI-gestützter Fischerkennung.

## Features

### 🎣 Kernfunktionen
- **Fangbuch** — Persönliches Fangtagebuch mit Fotos, Wetter-Snapshot, GPS-Koordinaten
- **Angelspots** — Private und öffentliche Angelplätze mit Kartenansicht (OpenStreetMap)
- **Beißindex/Forecast** — Wetterbasierte Vorhersage (Temperatur, Luftdruck, Wind, Bewölkung)
- **Community Feed** — Öffentliche Fänge, Kommentare, Likes
- **Catch of the Week** — Wöchentliche Community-Abstimmung
- **AI Fish Identification** — Fischarten-Erkennung per Foto (Google Generative AI)

### 👥 User & Admin
- **User Profile** — Skill-Level, Heimatregion, Sprache, Avatar
- **Account Management** — Registrierung, E-Mail-Verifizierung, Passwort-Reset, Account-Löschung
- **Admin Panel** — User-Verwaltung, Reports, Übersetzungen, E-Mail-Templates, SMTP-Einstellungen

### 📢 Werbesystem
- **Targeted Ads** — Banner & Card-Ads an verschiedenen Positionen
  - FEED, DASHBOARD_TOP/BOTTOM, CATCHES_TOP/BOTTOM, SPOTS_TOP, BITES_TOP
- **Advertiser Management** — Admin-Panel für Werbekunden-Verwaltung
- **Campaign Analytics** — Click- und Impression-Tracking
- **Scheduling** — Zeitgesteuerte Kampagnen mit Prioritäts-Sortierung

### 🌐 Mehrsprachigkeit
- Unterstützte Sprachen: Deutsch (DE), Englisch (EN), Französisch (FR)
- Dynamisch geladene Übersetzungen aus Datenbank
- Automatische Locale-Erkennung

### 🔒 Sicherheit
- JWT Authentication (7 Tage TTL)
- Bcrypt Passwort-Hashing (12 Rounds)
- Helmet CSP mit CSP-Header
- Rate Limiting (300 Req/15 Min)
- Zod Schema Validation auf allen POST/PUT-Endpoints

---

## Tech Stack

### Backend
| Komponente | Technologie |
|---|---|
| **Runtime** | Node.js 20 |
| **Framework** | Express.js |
| **Datenbank** | PostgreSQL + Prisma ORM |
| **Authentifizierung** | JWT (jsonwebtoken, bcryptjs) |
| **Validation** | Zod |
| **E-Mail** | Nodemailer (SMTP) |
| **AI/ML** | @google/generative-ai |
| **Security** | helmet, CORS, express-rate-limit |

### Frontend
| Komponente | Technologie |
|---|---|
| **Framework** | React 18.3.1 |
| **Routing** | react-router-dom 6 |
| **Build Tool** | Vite 5.4.2 |
| **PWA** | vite-plugin-pwa |
| **Rich Text Editor** | Quill 2.0.3 |
| **State Management** | React Context + useState |
| **Styling** | Custom CSS (CSS Variables, kein Framework) |

### Infrastruktur
- **Docker** — Multi-Stage Build (Client + Backend getrennt)
- **Environment** — `.env` für DATABASE_URL, JWT_SECRET, Mail-Credentials, API-Keys

---

## Projektstruktur

```
ANGELMATE/
├── client/                          # React Frontend
│   └── src/
│       ├── api/                     # API-Client (domain-organisiert)
│       ├── components/              # Wiederverwendbare UI-Komponenten
│       ├── context/                 # AuthContext, TranslationContext
│       ├── pages/                   # Seiten (Catches, Spots, Dashboard, etc.)
│       ├── utils/                   # Utilities (Locale, Translations)
│       ├── App.jsx                  # Router + Layout
│       ├── main.jsx                 # React Einstiegspunkt
│       └── index.css                # Globale Styles (CSS Variablen + Utilities)
├── src/                             # Node.js Backend
│   ├── controllers/                 # Request Handler
│   ├── routes/                      # API Route Definitionen
│   ├── middleware/                  # Auth, Error Handler
│   ├── services/                    # Business Logic (Forecast, Email, etc.)
│   ├── utils/                       # Helfer (JWT, AppError, Email, etc.)
│   ├── config/                      # Prisma Config
│   ├── app.js                       # Express Setup
│   └── server.js                    # Einstiegspunkt
├── prisma/
│   ├── schema.prisma                # Database Schema
│   └── seed.js                      # Seed Data
├── Dockerfile                       # Docker Multi-Stage Build
├── docker-compose.yml               # Docker Compose
└── package.json
```

---

## Schnellstart

### Voraussetzungen
- Node.js 20+
- PostgreSQL 13+
- npm oder yarn

### 1. Repository klonen & Dependencies installieren
```bash
git clone <repo-url>
cd ANGELMATE
npm install
```

### 2. Environment konfigurieren
```bash
cp .env.example .env
```

Wichtige Variablen in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/angelmate
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Mail (optional für lokale Entwicklung)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Generative AI (optional für Fish ID)
GOOGLE_AI_API_KEY=your-api-key
```

### 3. Prisma Client generieren
```bash
npm run prisma:generate
```

### 4. Datenbank-Migration ausführen
```bash
npm run prisma:migrate -- --name init
```

### 5. Seed-Daten laden (optional)
```bash
npm run db:seed
```

### 6. Backend starten
```bash
npm run dev
```

Server läuft unter: `http://localhost:3000`

### 7. Frontend starten (separates Terminal)
```bash
cd client
npm install
npm run dev
```

Frontend läuft unter: `http://localhost:5173`

---

## API Übersicht

**Base URL:** `http://localhost:3000/api/`

### Authentifizierung

| Method | Endpoint | Beschreibung |
|---|---|---|
| POST | `/auth/register` | Account erstellen |
| POST | `/auth/login` | Login (JWT zurückgeben) |
| POST | `/auth/forgot-password` | Passwort-Reset-Mail senden |
| POST | `/auth/reset-password` | Passwort über Token zurücksetzen |
| GET | `/auth/verify-email` | E-Mail verifizieren |
| GET | `/auth/me` | ✓ Aktuellen User abrufen |
| PUT | `/auth/profile` | ✓ Profil aktualisieren |
| PUT | `/auth/password` | ✓ Passwort ändern |
| DELETE | `/auth/account` | ✓ Account + alle assoziierten Daten löschen |

### Fangbuch (Catches)

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/catches` | ✓ Eigene Fänge auflisten |
| POST | `/catches` | ✓ Neuen Fang erstellen |
| PUT | `/catches/:id` | ✓ Fang bearbeiten |
| DELETE | `/catches/:id` | ✓ Fang löschen |

### Angelspots (Spots)

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/spots` | ✓ Eigene Spots auflisten |
| POST | `/spots` | ✓ Neuen Spot erstellen |
| PUT | `/spots/:id` | ✓ Spot bearbeiten |
| DELETE | `/spots/:id` | ✓ Spot löschen |

### Community Feed

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/community/feed` | Öffentliche Fänge (mit Pagination) |
| POST | `/community/:id/like` | ✓ Like toggeln |
| GET | `/community/:id/comments` | Kommentare abrufen |
| POST | `/community/:id/comment` | ✓ Kommentar hinzufügen |
| POST | `/community/:id/vote-cotw` | ✓ Für "Catch of the Week" abstimmen |

### Wetter & Forecast

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/forecast/today` | Beißindex für heute berechnen |

Query Parameter: `latitude`, `longitude`, `temperature`, `pressure`, `windSpeed`, `cloudCover`

### KI Features

| Method | Endpoint | Beschreibung |
|---|---|---|
| POST | `/ai/identify-fish` | ✓ Fischarte per Foto erkennen (Google AI) |
| POST | `/ai/forecast-analysis` | ✓ Forecast-Text analysieren |

### Werbung (Ads)

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/ads/current?position=FEED` | Zufällige Ad für Position |
| GET | `/ads/all?position=FEED` | Alle aktiven Ads für Position |
| POST | `/ads/:id/click` | Click-Tracking registrieren |
| POST | `/ads/:id/impression` | Impression-Tracking registrieren |

**Gültige Positionen:** `FEED`, `DASHBOARD_TOP`, `DASHBOARD_BOTTOM`, `CATCHES_TOP`, `CATCHES_BOTTOM`, `SPOTS_TOP`, `BITES_TOP`

### Admin Panel

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/admin/users` | ADMIN ✓ User auflisten |
| PUT | `/admin/users/:id` | ADMIN ✓ User bearbeiten |
| DELETE | `/admin/users/:id` | ADMIN ✓ User löschen |
| GET | `/admin/reports` | ADMIN ✓ Missbrauch-Reports auflisten |
| PUT | `/admin/reports/:id` | ADMIN ✓ Report als gelöst markieren |
| GET | `/admin/translations` | ADMIN ✓ Übersetzungen auflisten |
| POST | `/admin/translations` | ADMIN ✓ Übersetzung erstellen |
| PUT | `/admin/translations/:id` | ADMIN ✓ Übersetzung bearbeiten |
| GET | `/admin/ads` | ADMIN ✓ Ads verwalten |
| POST | `/admin/ads` | ADMIN ✓ Ad erstellen |
| PUT | `/admin/ads/:id` | ADMIN ✓ Ad bearbeiten |
| DELETE | `/admin/ads/:id` | ADMIN ✓ Ad löschen |
| GET | `/admin/advertisers` | ADMIN ✓ Werbekunden auflisten |
| POST | `/admin/advertisers` | ADMIN ✓ Werbekunde erstellen |
| PUT | `/admin/advertisers/:id` | ADMIN ✓ Werbekunde bearbeiten |
| DELETE | `/admin/advertisers/:id` | ADMIN ✓ Werbekunde löschen |

*Note: ✓ = Requires authenticated Bearer Token*

### Statistiken

| Method | Endpoint | Beschreibung |
|---|---|---|
| GET | `/stats/overview` | ✓ Persönliche Stats (Fang-Count, avg. Gewicht, etc.) |

---

## Authentifizierung

### Login & Token-Handling

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "angler@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "angler@example.com",
    "name": "Max Müller",
    "role": "USER"
  }
}
```

**Autorisierte Requests:**
```bash
curl -X GET http://localhost:3000/api/catches \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Datenbank-Schema

Wichtige Models in `prisma/schema.prisma`:

| Model | Beschreibung |
|---|---|
| `User` | Benutzer mit Profil, Auth-Daten |
| `Catch` | Fang mit Foto, Wetter, GPS |
| `Spot` | Angelplatz (privat/öffentlich) |
| `Comment` | Kommentar zu öffentlichem Fang |
| `Like` | Like auf öffentlichen Fang |
| `WeeklyVote` | "Catch of the Week" Abstimmung |
| `Report` | Missbrauch-Meldung |
| `Translation` | Mehrsprachigkeits-Einträge |
| `EmailTemplate` | E-Mail-Templates |
| `SmtpSettings` | SMTP-Konfiguration |
| `Advertiser` | Werbekunde |
| `Ad` | Anzeige (Banner/Card) |
| `PasswordResetToken` | Passwort-Reset Token |
| `EmailVerificationToken` | E-Mail-Verifizierungs Token |

---

## Deployment

### Docker Compose
```bash
docker-compose up -d
```

Startet PostgreSQL, Backend und Frontend in separaten Containern.

### Production Build
```bash
docker build -t angelmate:latest .
docker run -p 3000:3000 -p 5173:5173 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  angelmate:latest
```

---

## Code-Konventionen

### Backend
- **Controller-Pattern** mit `catchAsync` Wrapper
- **Zod Validation** auf POST/PUT
- **Prisma `.select()`** statt wildcard (keine Passwort-Hashes)
- **AppError** für konsistente Fehlerbehandlung
- **Datei-Naming:** `kebab-case.controller.js`, `kebab-case.routes.js`

### Frontend
- **Hooks & Context** statt Redux/Zustand
- **Domain-organisierte API** (`api.catches.*`, `api.spots.*`)
- **CSS-Variablen** für Theming
- **Utility-Klassen** (`.btn-primary`, `.section`, `.error-msg`)

---

## Nächste Entwicklungsschritte

- [ ] Bild-Upload zu Cloud Storage (S3/Cloudinary)
- [ ] PostGIS für Geo-Suche
- [ ] Push Notifications
- [ ] Offline-Mode mit Service Worker
- [ ] Advanced Forecast (externe Wetter-API Integration)
- [ ] Fishing Challenges & Leaderboards
- [ ] Dark Mode UI
- [ ] Mobile App (React Native)

---

## Lizenz

MIT

## Support

Für Fragen oder Bugs: [Issues im Repository](https://github.com)
