FROM node:8.9.1-slim

COPY package.json /src/package.json

WORKDIR /src
RUN npm install

COPY . /src

ENV BASIC_AUTH_USERNAME user
ENV BASIC_AUTH_PASSWORD password

EXPOSE 8080

CMD ["npm", "start"]
