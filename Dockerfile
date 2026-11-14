FROM node:22-alpine

# Same pnpm version as packageManager in package.json
RUN npm install -g pnpm@11.24.0

WORKDIR /app

# Install dependencies first so code changes don't invalidate this layer
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000
# shortcut: image keeps devDependencies (~simpler, larger); switch to Next standalone output if size matters
CMD ["pnpm", "start"]
