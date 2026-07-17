FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["node", "server.js"]
