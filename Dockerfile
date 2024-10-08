FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build ./app/dist ./dist
COPY --from=build ./app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build ./app/package*.json ./
RUN npm i --omit-dev

EXPOSE 3001

CMD [ "npm", "run", "start:prod" ]