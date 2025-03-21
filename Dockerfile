FROM node:20.18.0-alpine

MAINTAINER Andres Olivares

WORKDIR /src

COPY package.json .npmrc ./

COPY . .

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN apk add --no-cache libcurl alpine-sdk curl-dev
RUN npm install node-libcurl --build-from-source

ENV TZ="America/Santiago"

RUN npm install
RUN npm run build

EXPOSE 4031
CMD ["npm", "start"]
