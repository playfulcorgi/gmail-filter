FROM node:7.7.1

VOLUME ["/service/configuration"]

WORKDIR /service

COPY . .

RUN npm install