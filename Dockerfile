# syntax=docker/dockerfile:1.7
#
# Multi-stage build: the final image contains only the built app, the server
# and its production dependencies (no TypeScript, Vite, test tools or sources).
# CI/CD is unaffected: `docker build .` still produces one ordinary image, and
# BuildKit caches the dependency layers so rebuilds are fast.
ARG NODE_VERSION=22

# ---- 1. all dependencies (cached until package*.json changes) ---------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# onnxruntime-node (a transitive dev dependency of the in-browser speech model)
# would download native server binaries we never use; skip them.
ENV ONNXRUNTIME_NODE_INSTALL=skip
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- 2. build the web app ----------------------------------------------------
FROM deps AS build
COPY . .
# prebuild copies the speech runtime into public/ort, then: tsc + vite build
RUN npm run build
# Optional: run the tests as part of the build with `--target test`
FROM build AS test
RUN npm test

# ---- 3. production-only dependencies ------------------------------------------
FROM node:${NODE_VERSION}-alpine AS prod-deps
WORKDIR /app
ENV NODE_ENV=production ONNXRUNTIME_NODE_INSTALL=skip
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- 4. runtime image ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/puter ./puter
COPY package.json server.ts ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1
CMD ["node_modules/.bin/tsx", "server.ts"]
