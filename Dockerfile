# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Enable corepack and install dependencies with pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for single page application
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
