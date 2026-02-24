FROM node:18-alpine AS build

ARG REACT_APP_BACKEND_API_URL=http://100.93.255.84:8000
ENV REACT_APP_BACKEND_API_URL=${REACT_APP_BACKEND_API_URL}

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --prefer-offline --no-audit --no-fund

COPY frontend/ ./
# Ensure the React build picks up `REACT_APP_*` env vars
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/frontend/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
