FROM node:16-alpine

WORKDIR /app

ENV NODE_ENV production

COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 zombbbot
RUN chown -R zombbbot:nodejs /app

USER zombbbot
RUN npm ci --production

CMD ["node", "index.js"]
