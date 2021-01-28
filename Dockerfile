FROM node:14-alpine as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY tsconfig.json ./
COPY src ./src

RUN yarn build

FROM node:14-buster-slim

RUN apt-get update \
     && apt-get install -y wget gnupg ca-certificates \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-stable \
     && rm -rf /var/lib/apt/lists/* 

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY --from=builder /app/build ./build

EXPOSE 7200

CMD yarn start


