FROM node:8.9.1-slim

COPY package.json /src/package.json

WORKDIR /src
RUN npm install

COPY . /src

EXPOSE 8080

CMD ["npm", "start"]
