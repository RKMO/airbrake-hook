FROM node:4.4-slim

RUN mkdir -p /app

ADD package.json /app/package.json

WORKDIR /app

RUN npm install

ADD . /app

RUN npm run build

EXPOSE 3020

CMD ["node", "dist/server.js"]
