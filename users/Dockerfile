FROM node:lts

WORKDIR /app

COPY . .

RUN npm install -g pnpm@latest

RUN pnpm install

EXPOSE 8000

CMD ["pnpm", "dev"]