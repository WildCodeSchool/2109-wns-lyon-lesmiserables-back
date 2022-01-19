FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY tsconfig.json ./
COPY ormconfig.json ./
COPY src src
RUN npm run build
CMD node ./dist/index.js