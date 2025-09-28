FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

RUN rm -rf node_modules/.cache

EXPOSE 3500

CMD ["node", "server.js"]
