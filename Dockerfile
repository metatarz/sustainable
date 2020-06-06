FROM node:12.13.0-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src

RUN npm ci --quiet && npm run build

FROM node:12.13.0-alpine

WORKDIR /app

COPY package*.json ./
COPY process.json ./

RUN npm ci --quiet --only=production
RUN npm install pm2 -g

COPY --from=builder /usr/src/app/build ./build

EXPOSE 6069

CMD ["pm2-runtime", "process.json"]



