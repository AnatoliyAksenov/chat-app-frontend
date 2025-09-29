# STAGE 1: Build the frontend app
FROM node:20.19-slim AS builder

ARG VITE_API_BASE_URL

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN echo "VITE_API_BASE_URL=$(echo ${VITE_API_BASE_URL} | xargs)" > .env

# Build the app
RUN npm run build

# STAGE 2: Serve with Nginx
FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]