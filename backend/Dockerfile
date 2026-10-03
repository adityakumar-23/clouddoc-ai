# ==============================================================================
# CloudDoc AI - Backend Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install LibreOffice and Tesseract OCR dependencies for enterprise Linux document transformation
RUN apk add --no-cache \
    libreoffice \
    tesseract-ocr \
    tesseract-ocr-data-eng \
    font-dejavu \
    font-noto

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create local storage volume directory
RUN mkdir -p /app/storage && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
