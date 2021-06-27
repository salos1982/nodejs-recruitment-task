FROM node:15.14-alpine

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

RUN mkdir ./src
COPY ./src ./src
RUN mkdir ./config
COPY ./config ./config

CMD ["node", "./src/app.js"]