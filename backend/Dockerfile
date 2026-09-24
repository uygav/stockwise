
# ---- Build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci

COPY backend ./backend
RUN npm run build --workspace=backend

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --omit=dev --workspace=backend

COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 4000
CMD ["node", "backend/dist/index.js"]