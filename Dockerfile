# Dockerfile
FROM node:22.14.0-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=development

COPY . .
RUN npx prisma generate

FROM node:22.14.0-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm ci --only=production && npm cache clean --force

FROM node:22.14.0-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/main"]