# =========================
# Build stage
# =========================
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma config requires DATABASE_URL even during generate.
# This is only a temporary build-time value.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npx prisma generate
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./

# Install production dependencies plus tsx because
# Prisma seed files are TypeScript.
RUN npm ci --omit=dev \
    && npm install --no-save --include=dev tsx

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src ./src

ENV NODE_ENV=production

EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]