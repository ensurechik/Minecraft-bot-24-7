FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY dashboard/package*.json ./dashboard/
RUN cd dashboard && npm install

COPY . .

RUN npm run build

WORKDIR /app/dashboard

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
