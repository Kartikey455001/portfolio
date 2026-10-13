FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src
RUN DATABASE_URL=postgresql://portfolio:portfolio_dev_only@localhost:5432/portfolio npx prisma generate && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
