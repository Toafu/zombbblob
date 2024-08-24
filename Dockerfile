FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 zombbbot
RUN chown -R zombbbot:nodejs /app

USER zombbbot
RUN npm ci
RUN npm run build
RUN npm install --omit-dev

CMD ["node", "build/index.js"]
