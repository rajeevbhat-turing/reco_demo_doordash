# LLM agent sidecar — Playwright + Hono (Phase 4). See deploy_plan.md.
FROM node:20-bookworm AS deps
WORKDIR /app
COPY tools/reco-agent/package.json tools/reco-agent/package-lock.json ./
RUN npm ci

FROM node:20-bookworm
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY tools/reco-agent/package.json tools/reco-agent/package-lock.json ./
COPY tools/reco-agent/tsconfig.json ./
COPY tools/reco-agent/src ./src
COPY tools/reco-agent/prompts ./prompts

RUN npx playwright install chromium

ENV PORT=8003
ENV RECO_AGENT_TARGET_URL=http://dashdoor:3000
ENV RECO_TASKS_PATH=/app/data/reco-tasks/seed.json
ENV RECO_AGENT_HEADLESS=1

EXPOSE 8003

HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=30s \
  CMD wget -qO- http://127.0.0.1:8003/health || exit 1

CMD ["npx", "tsx", "src/server.ts"]
