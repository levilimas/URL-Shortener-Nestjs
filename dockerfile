FROM node:18-alpine As base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install

FROM base As development
ENV NODE_ENV=development
COPY . .
RUN npm run build
CMD ["npm", "run", "start:dev"]

FROM base As build
ENV NODE_ENV=production
COPY . .
RUN npm run build

FROM node:18-alpine As production
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 -g && \
    npm install --only=production

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]