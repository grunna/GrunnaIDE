FROM node:13
USER root
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run buildProd
EXPOSE 8080
CMD [ "node", "server.js" ]
