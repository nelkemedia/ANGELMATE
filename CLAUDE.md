# AngelMate — Project Context for Claude Code

## Zweck der App

**AngelMate** ist eine Full-Stack-Angelbegleiter-PWA. Kernfunktionen:

- **Fangbuch**: Persönliches Fangtagebuch mit Fotos, Wetter-Snapshot, GPS-Koordinaten
- **Spots**: Private/öffentliche Angelplätze mit Karte
- **Forecast / Beißindex**: Wetterbasierte Beißindex-Berechnung (Temperatur, Luftdruck, Wind, Bewölkung)
- **Community Feed**: Öffentliche Fänge, Kommentare, Likes, wöchentliche "Catch of the Week"-Wahl
- **User Profile**: Skill-Level, Heimatregion, Sprache, Avatar (Base64)
- **Admin Panel**: User-Verwaltung, Reports, Übersetzungen, E-Mail-Templates, SMTP-Einstellungen
- **Mehrsprachigkeit**: DE / EN / FR (Übersetzungen in DB, via API geladen)
- **KI**: Fischarten-Identifikation & Forecast-Analyse via Google Generative AI

---

## Tech Stack

### Backend
| Was | Womit |
|---|---|
| Framework | Express.js (Node.js 20) |
| Datenbank | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Zod |
| E-Mail | Nodemailer (konfigurierbares SMTP) |
| Security | helmet (CSP), CORS, express-rate-limit |
| KI | @google/generative-ai |

### Frontend
| Was | Womit |
|---|---|
| Framework | React 18.3.1 |
| Routing | react-router-dom 6 |
| Build | Vite 5.4.2 |
| PWA | vite-plugin-pwa |
| Rich Text | Quill 2.0.3 |
| State | React Context + useState (kein Redux/Zustand) |
| Styling | Custom CSS (CSS variables, kein Tailwind/MUI) |

### Infra
- Docker Multi-Stage Build (client + backend getrennt)
- `.env` für DATABASE_URL, JWT_SECRET, MAIL-Credentials

---

## Projektstruktur

```
ANGELMATE/
├── client/                    # React Frontend
│   └── src/
│       ├── api/               # Fetch-Wrapper (client.js, organisiert nach Domain)
│       ├── components/        # Wiederverwendbare Komponenten
│       ├── context/           # AuthContext, TranslationContext
│       ├── pages/             # Seiten-Komponenten
│       ├── utils/             # Locale-Erkennung, Übersetzungs-Utilities
│       ├── App.jsx            # Router + Layout
│       ├── main.jsx           # React-Einstiegspunkt
│       └── index.css          # Globale Styles (CSS-Variablen + Utility-Klassen)
├── src/                       # Node.js Backend
│   ├── controllers/           # Request-Handler
│   ├── routes/                # Route-Definitionen
│   ├── middleware/            # protect, optionalAuth, errorHandler
│   ├── services/              # Business-Logik (Forecast-Berechnung)
│   ├── utils/                 # JWT, AppError, E-Mail, catchAsync
│   ├── config/                # Prisma-Client
│   ├── app.js                 # Express-Setup (Middleware, Routes, CSP)
│   └── server.js              # Einstiegspunkt
├── prisma/
│   ├── schema.prisma          # DB-Schema (11 Models)
│   └── seed.js
├── Dockerfile
└── package.json               # Backend-Dependencies
```

---

## Datenbank-Schema (Prisma)

Wichtige Models in `prisma/schema.prisma`:

| Model | Schlüsselfelder |
|---|---|
| `User` | name, email, passwordHash, homeRegion, skillLevel (beginner/intermediate/advanced), language, avatarBase64, role (USER/ADMIN) |
| `Catch` | fishSpecies, weight, length, caughtAt, waterName, lat/lng, bait, technique, weatherSnapshot (JSON), imageUrl, isPublic, userId |
| `Spot` | title, description, latitude, longitude, visibility (private/public), targetSpecies, userId |
| `Comment` | text, userId, catchId |
| `Like` | userId + catchId (unique pair) |
| `Translation` | locale, key, value |
| `EmailTemplate` | name, locale, subject, htmlBody |
| `SmtpSettings` | host, port, user, pass, fromName, fromEmail |
| `UserStatus` | ACTIVE, INACTIVE, PENDING_VERIFICATION |

---

## API-Routen

**Präfix:** `/api/`

| Route | Auth | Beschreibung |
|---|---|---|
| `POST /auth/register` | — | Account erstellen, Verifizierungs-Mail |
| `POST /auth/login` | — | JWT zurückgeben |
| `GET /auth/me` | ✓ | Aktueller User |
| `PUT /auth/profile` | ✓ | Profil aktualisieren |
| `PUT /auth/password` | ✓ | Passwort ändern |
| `GET /catches` | ✓ | Fangbuch des Users |
| `POST /catches` | ✓ | Fang erstellen |
| `PUT /catches/:id` | ✓ | Fang bearbeiten |
| `DELETE /catches/:id` | ✓ | Fang löschen |
| `GET /spots` | ✓ | Spots des Users |
| `GET /community/feed` | optional | Öffentlicher Feed |
| `POST /community/:id/like` | ✓ | Like toggeln |
| `GET /forecast/today` | — | Beißindex berechnen |
| `POST /ai/identify-fish` | ✓ | Fischart per Bild erkennen |
| `GET /admin/*` | ADMIN | Admin-Verwaltung |
| `GET /stats/overview` | ✓ | User-Statistiken |

---

## Code-Konventionen

### Backend

**Controller-Pattern** — immer `catchAsync` verwenden:
```js
// src/controllers/catches.controller.js
export const createCatch = catchAsync(async (req, res) => {
  const data = createCatchSchema.parse(req.body);   // Zod-Validation oben im File
  const result = await prisma.catch.create({
    data: { ...data, userId: req.user.id },
    select: { id: true, fishSpecies: true }          // Immer .select() — kein *
  });
  res.status(201).json(result);
});
```

**Fehler werfen:**
```js
throw new AppError('Nicht gefunden', 404, 'ERROR_NOT_FOUND');
```

**Route-Struktur:**
```js
// src/routes/catches.routes.js
router.use(protect);           // Alle Routes darunter geschützt
router.get('/', getCatches);
router.post('/', createCatch);
```

**Datei-Naming:** `kebab-case.controller.js`, `kebab-case.routes.js`

---

### Frontend

**Seiten-Komponente** (typisches Pattern):
```jsx
// client/src/pages/Catches.jsx
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';

export default function Catches() {
  const { user } = useAuth();
  const { t } = useT();
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catches.list()
      .then(setCatches)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="section">
      <h2>{t('catches.title')}</h2>
      {catches.map(c => <CatchCard key={c.id} catch={c} />)}
    </div>
  );
}
```

**Wiederverwendbare Komponente:**
```jsx
// client/src/components/Avatar.jsx
export default function Avatar({ src, name, size = 36, className = '' }) {
  const letter = name?.[0]?.toUpperCase() ?? '?';
  const style = { width: size, height: size };
  if (src) return <img src={src} alt={name} className={`avatar-img ${className}`} style={style} />;
  return <div className={`avatar-letter ${className}`} style={style}>{letter}</div>;
}
```

**API-Client-Aufruf:**
```js
// client/src/api/client.js — organisiert nach Domain
export const api = {
  catches: {
    list: () => request('/catches'),
    create: (data) => request('/catches', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/catches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/catches/${id}`, { method: 'DELETE' }),
  },
  // ...weitere Domains
};
```

**Globaler State:**
- `useAuth()` → `{ user, token, login, logout }` — Token in `localStorage` unter Key `am_token`
- `useT()` → `{ t, locale }` — Sprache in `localStorage` unter Key `am_lang`

**Routing** (`App.jsx`):
```jsx
<Route path="/catches" element={
  <ProtectedRoute><Layout><Catches /></Layout></ProtectedRoute>
} />
```

---

## Styling-System

Kein CSS-Framework. Alles in `client/src/index.css`.

**CSS-Variablen** (`:root`):
```css
--green: #2d7a4f;
--blue: #1a6fa8;
--radius: 12px;
--shadow: 0 2px 8px rgba(0,0,0,.1);
```

**Utility-Klassen:**
- `.btn-primary`, `.btn-link` — Buttons
- `.section` — Seitenbereich-Wrapper
- `.stat-card` — Dashboard-Kacheln
- `.error-msg` — Fehlermeldungen
- `.avatar-img`, `.avatar-letter` — Avatar-Darstellung

---

## Mehrsprachigkeit

- Übersetzungen in DB-Tabelle `Translation` (locale, key, value)
- Frontend lädt via `GET /api/translations?locale=de`
- Zugriff: `t('nav.catches')` via `useT()` Hook
- Fallback: Key-Name wenn Übersetzung fehlt
- Locales: `de`, `en`, `fr`

---

## Sicherheit

- Helmet CSP (connect-src: nominatim.openstreetmap.org, api.open-meteo.com)
- Rate Limit: 300 Requests / 15 Minuten
- JWT 7 Tage Laufzeit, kein Cookie (localStorage)
- Bcrypt 12 Rounds
- Zod-Validation auf allen POST/PUT-Endpoints
- Immer `.select()` in Prisma-Queries (kein Passwort-Hash leaken)
