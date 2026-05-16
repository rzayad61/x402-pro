FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source
COPY src/ ./src/
COPY .env.example ./

# Expose port
EXPOSE 4021

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4021/health || exit 1

# Start
CMD ["node", "src/index.js"]
