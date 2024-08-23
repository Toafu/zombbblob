FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV production

COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 zombbbot
RUN chown -R zombbbot:nodejs /app

USER zombbbot
RUN npm ci --production
RUN node_modules/.bin/tsc

CMD ["node", "build/index.js"]
