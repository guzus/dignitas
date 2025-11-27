FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source and build
COPY tsconfig.json ./
COPY src ./src

# Install dev deps for build, then remove
RUN npm install && npm run build && npm prune --production

# Expose port
EXPOSE 8080

# Cloud Run uses PORT env var
ENV PORT=8080

CMD ["node", "dist/server.js"]
