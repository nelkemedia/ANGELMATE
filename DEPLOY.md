# AngelMate VPS Deploy Guide

## Deployment Checklist

### 1. Pre-Deploy Verification ✅
- [x] Datenbank-Migration behoben (init.js, Dockerfile)
- [x] Frontend gebaut
- [x] Dockerfile optimiert (Multi-Stage, Production)
- [x] Environment-Variablen in .env.example dokumentiert
- [x] .env nicht im Git (.gitignore)

### 2. VPS Setup Required

#### Environment Variables (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/angelmate"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="AngelMate"
SMTP_FROM_EMAIL="noreply@example.com"

# Google AI (optional)
GOOGLE_API_KEY="your-google-generative-ai-key"

# Frontend
VITE_API_URL="https://your-domain.com/api"
```

#### System Requirements
- Docker & Docker Compose
- PostgreSQL 13+ (or managed database)
- Node.js 20+ (for local development)
- 2GB RAM minimum, 5GB storage

### 3. Deploy Commands

#### Build & Push to VPS
```bash
# 1. Push to git
git push origin master

# 2. On VPS: Clone/Pull
cd /app
git pull origin master

# 3. Build Docker image
docker build -t angelmate:latest .

# 4. Run container with proper env
docker run -d \
  --name angelmate \
  -p 3000:3000 \
  --env-file .env \
  -e DATABASE_URL="postgresql://..." \
  angelmate:latest
```

#### With Docker Compose (Recommended)
Create `docker-compose.yml` on VPS:
```yaml
version: '3.8'
services:
  app:
    build: .
    container_name: angelmate
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - SMTP_FROM_NAME=${SMTP_FROM_NAME}
      - SMTP_FROM_EMAIL=${SMTP_FROM_EMAIL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - VITE_API_URL=${VITE_API_URL}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

Then:
```bash
docker-compose up -d
```

### 4. Post-Deploy Verification

```bash
# Check if container is running
docker ps | grep angelmate

# View logs
docker logs -f angelmate

# Test API endpoint
curl https://your-domain.com/api/auth/me
```

### 5. Rollback Plan

If something breaks:
```bash
# Stop current container
docker stop angelmate
docker rm angelmate

# Checkout previous commit
git checkout HEAD~1

# Rebuild and run
docker build -t angelmate:prev .
docker run -d --name angelmate ... angelmate:prev
```

### 6. Database Backup (Before First Deploy)

```bash
# Create backup
pg_dump -h host -U user angelmate > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -h host -U user angelmate < backup_20260428.sql
```

### 7. Monitoring

Setup log monitoring:
- Container logs: `docker logs -f angelmate`
- Nginx/Reverse Proxy logs
- Database connection logs

---

## Current Deploy State
- **Branch:** master
- **Latest commit:** 611afc2 (fix init.js for db migration)
- **Docker:** Ready ✅
- **Migrations:** Auto-sync on startup ✅
- **Code:** Production-ready ✅
