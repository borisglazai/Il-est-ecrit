FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/state.mjs ./server/state.mjs
COPY --from=build /app/portable ./portable
USER node
EXPOSE 3000
CMD ["node","portable/node.mjs"]
