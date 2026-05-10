FROM node:24.14.1-alpine as build

WORKDIR /app

COPY package*.json .
COPY prisma ./prisma

RUN npm install

RUN npx prisma generate

COPY . .
RUN npm run build
RUN npm prune --production


FROM node:24.14.1-alpine

WORKDIR /app

COPY --from=build ./app/dist ./dist
COPY --from=build ./app/node_modules ./node_modules

CMD ["node", "dist/src/main"]

