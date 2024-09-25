FROM node:20-slim as deps
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

FROM node:20-slim
# Install curl wget for healthcheck
RUN  apt-get update \
  && apt-get install -y curl wget \
  && apt-get install -y nginx \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/ /usr/src/app/
COPY . .

RUN chmod +x ./quartz/bootstrap-cli.mjs
RUN node ./quartz/bootstrap-cli.mjs build

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]