FROM node:12
USER root
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run uglify
EXPOSE 8080
CMD [ "node", "server.js" ]
