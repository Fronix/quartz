FROM node:20-slim as builder


WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json* .
RUN npm ci

FROM node:20-slim
# Install curl wget for healthcheck
RUN  apt-get update \
  && apt-get install -y curl wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY . .
CMD ["npx", "quartz", "build", "--serve"]
