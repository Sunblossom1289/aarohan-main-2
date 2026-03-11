# --- Stage 1: Build the React App ---
FROM node:18-alpine as build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm install

# Copy frontend source code (backend is excluded via .dockerignore)
COPY . .

# Build for production
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
# Note: Vite usually builds to 'dist'. If create-react-app, it's 'build'.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]