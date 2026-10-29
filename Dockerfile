# EventHub Production Container
FROM node:22-slim

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both backend and frontend
RUN npm --prefix backend install && npm --prefix frontend install

# Copy application source code
COPY . .

# Build frontend production bundle
RUN npm --prefix frontend run build

# Default environment configuration
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start unified full-stack server
CMD ["node", "start.js"]

