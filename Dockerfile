# Based on Next.js standalone Dockerfile with Payload CMS optimizations
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install Sharp dependencies for image optimization
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    python3 \
    pkgconfig

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy lockfiles first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --prod=false

# Rebuild the source code only when needed
FROM base AS builder

# Install Sharp dependencies for build
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3

WORKDIR /app
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
ARG NEXT_PUBLIC_PREVIEW_SECRET
ENV NEXT_PUBLIC_PREVIEW_SECRET=$NEXT_PUBLIC_PREVIEW_SECRET

# Build the application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner

# Install only Sharp runtime dependencies (no build tools)
RUN apk add --no-cache \
    vips \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create media directory with proper permissions
RUN mkdir -p public/media && \
    chown -R nextjs:nodejs public/media && \
    chmod -R 755 public/media

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
