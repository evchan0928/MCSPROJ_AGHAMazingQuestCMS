FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev dependencies) to avoid lockfile conflicts
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]