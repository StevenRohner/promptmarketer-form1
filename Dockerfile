FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json build.mjs integration.js index.html server.mjs validation.mjs ./
COPY test ./test
RUN npm test && npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/server.mjs /app/validation.mjs /app/package.json ./
USER node
CMD ["node", "server.mjs"]
