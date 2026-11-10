FROM node:20-alpine AS b
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG CDN_URL
ENV CDN_URL=$CDN_URL
RUN npm run build
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=b /app/.next/standalone ./
COPY --from=b /app/.next/static ./.next/static
COPY --from=b /app/public ./public
CMD ["node", "server.js"]
