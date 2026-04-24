# ---- Build React frontend ----
FROM node:20-alpine AS client-builder
WORKDIR /build/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Production image ----
FROM node:20-alpine AS production
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source
COPY src/ ./src/
COPY prisma/ ./prisma/

# Copy built frontend
COPY --from=client-builder /build/client/dist ./client/dist

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

# Run DB migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
