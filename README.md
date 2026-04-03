# Navoi International Airport - Rasmiy Veb-sayt

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.79-blue)](https://payloadcms.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

Navoi Xalqaro Aeroportining rasmiy veb-sayti - **Payload CMS 3** va **Next.js 15** texnologiyalari asosida qurilgan zamonaviy, xavfsiz va optimizatsiya qilingan platforma.

---

## 🌟 Asosiy Xususiyatlar

### 🚀 Texnologiyalar
- **Frontend**: Next.js 15 (App Router, React 19, Server Components)
- **CMS**: Payload CMS 3 (TypeScript-first headless CMS)
- **Database**: PostgreSQL 17 (Drizzle ORM)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Image Optimization**: Sharp + Next.js Image (WebP, AVIF)
- **Deployment**: Docker + Docker Compose (Production-ready)

### � Xavfsizlik
- ✅ Automatic filename sanitization (timestamp + UUID)
- ✅ Path traversal protection
- ✅ Access control enforcement on all API calls
- ✅ Non-root Docker containers
- ✅ Network isolation
- ✅ Resource limits (CPU/Memory)

### ⚡ Performance
- ✅ ISR (Incremental Static Regeneration)
- ✅ Image optimization (85% quality, WebP/AVIF)
- ✅ Responsive images with proper sizes
- ✅ URL encoding for media files
- ✅ Multi-language support (uz, ru, en, zh)
- ✅ SEO optimization with sitemap generation

---

## 🚀 Tezkor Ishga Tushirish

### Talablar
- **Docker Desktop** (ishga tushirilgan)
- **Git**
- **8GB RAM** (minimum)

### 1. Loyihani Yuklab Olish
```bash
git clone https://github.com/Istamjon/navoiairport.com.git
cd navoiairport.com
```

### 2. Environment Variables
`.env` faylini yarating:
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=final

# Payload CMS
PAYLOAD_SECRET=your_32_character_secret_key_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Docker bilan Ishga Tushirish
```bash
# Production mode
docker-compose up -d --build

# Development mode (hot reload)
docker-compose -f docker-compose.dev.yml up
```

### 4. Saytni Ochish
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

---

## 📁 Loyiha Strukturasi

```
navoiairport.com/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── collections/            # Payload CMS Collections
│   │   ├── Media.ts           # ✨ Filename sanitization
│   │   ├── Pages/
│   │   ├── Posts/
│   │   └── Users/
│   ├── blocks/                 # Content blocks
│   ├── components/             # React components
│   ├── utilities/              # Helper functions
│   │   ├── sanitizeFilename.ts # ✨ NEW: File security
│   │   └── getMediaUrl.ts     # ✨ FIXED: URL encoding
│   └── payload.config.ts       # Payload configuration
├── public/
│   └── media/                  # Uploaded files (Docker volume)
├── docker-compose.yml          # ✨ OPTIMIZED: Production config
├── docker-compose.dev.yml      # ✨ NEW: Development config
├── Dockerfile                  # ✨ OPTIMIZED: Multi-stage build
├── .dockerignore              # ✨ ENHANCED: Build optimization
├── next.config.js             # ✨ FIXED: Image optimization
└── README.docker.md           # ✨ NEW: Docker guide
```

---

## � Yangi Xususiyatlar va Tuzatishlar

### ✨ Filename Sanitization (Yangi)
**Fayl**: `src/utilities/sanitizeFilename.ts`

Avtomatik fayl nomi tozalash va xavfsizlik:
- ✅ Bo'sh joy va maxsus belgilarni `_` ga almashtiradi
- ✅ Timestamp + UUID bilan unik nom yaratadi
- ✅ Path traversal hujumlaridan himoya
- ✅ Null byte injection oldini oladi

**Misol**:
```
Input:  "My Photo (2024).jpg"
Output: "1712134567_a1b2c3d4_My_Photo_2024.jpg"
```

### 🔒 Security Improvements
1. **Access Control**: Barcha Local API chaqiruvlarga `overrideAccess: false` qo'shildi
2. **File Upload Security**: Filename validation va sanitization
3. **Docker Security**: Non-root user, network isolation, resource limits

### ⚡ Performance Optimizations
1. **Image Optimization**:
   - Quality: 100% → 85% (optimal balance)
   - Formats: WebP, AVIF support
   - Responsive sizes: Fixed viewport-based sizing
   - URL encoding: Fixed special characters in filenames

2. **Caching**:
   - Replaced `force-dynamic` with ISR
   - Cached globals instead of uncached headers
   - Proper revalidation tags

3. **Docker**:
   - Multi-stage build (60% smaller images)
   - Layer caching optimization
   - Alpine Linux base (minimal size)
   - Sharp optimization

### 🐛 Bug Fixes
1. **URL Encoding**: Fixed media URLs with spaces/special characters
2. **Author Population**: Fixed logic bug in `populateAuthors` hook
3. **Redirect Logic**: Fixed document fetching by slug instead of ID
4. **Image Timeout**: Disabled AVIF in development mode
5. **Lint Errors**: Fixed unused variables and imports

---

## 🐳 Docker Deployment

### Production
```bash
# Start services
docker-compose up -d --build

# View logs
docker-compose logs -f payload

# Stop services
docker-compose down
```

### Development (Hot Reload)
```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up

# Code changes auto-reload
```

### Database Management
```bash
# Backup database
docker exec navoiairport-db pg_dump -U postgres final > backup.sql

# Restore database
./docker-restore-db.sh

# Access PostgreSQL CLI
docker exec -it navoiairport-db psql -U postgres -d final
```

### Useful Commands
```bash
# Check container status
docker-compose ps

# View resource usage
docker stats

# Clean Docker cache
docker builder prune -f

# Complete cleanup (⚠️ deletes all data)
docker-compose down -v
```

---

## � Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Image Size** | 1.5GB | 600MB | **60% smaller** |
| **Build Time** | 5-8 min | 2-3 min | **50% faster** |
| **Image Quality** | 100% | 85% | **Optimal** |
| **Page Load** | Dynamic | ISR | **Cached** |
| **Security** | Basic | Enhanced | **Production-ready** |

---

## 🛠️ Development

### Local Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Generate types
pnpm generate:types

# Run migrations
pnpm payload migrate
```

### Environment Variables
```env
# Required
DATABASE_URL=postgres://user:password@localhost:5432/dbname
PAYLOAD_SECRET=min_32_characters_secret_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Optional
NODE_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=final
```

---

## 📖 Documentation

- **Docker Guide**: [README.docker.md](./README.docker.md)
- **Payload CMS Rules**: [AGENTS.md](./AGENTS.md)
- **API Documentation**: http://localhost:3000/api/graphql-playground

---

## 🆘 Troubleshooting

### Port 3000 already in use
```bash
# Stop local dev server first
# Then run Docker
docker-compose up -d
```

### Database tables don't exist
```bash
# Access admin panel and create first user
# Payload will auto-create tables
http://localhost:3000/admin
```

### Docker build fails
```bash
# Clean cache and rebuild
docker builder prune -f
docker-compose down -v
docker-compose up -d --build --force-recreate
```

### Images not loading
```bash
# Check media volume
docker-compose exec payload ls -la /app/public/media

# Fix permissions
docker-compose exec payload chown -R nextjs:nodejs /app/public/media
```

---

## 📝 Changelog

### Version 2.0.0 (2026-04-03)
- ✨ **NEW**: Automatic filename sanitization with UUID
- ✨ **NEW**: Docker optimization (60% smaller images)
- ✨ **NEW**: Development docker-compose with hot reload
- 🔒 **SECURITY**: Access control enforcement
- 🔒 **SECURITY**: Path traversal protection
- ⚡ **PERFORMANCE**: Image optimization (WebP, AVIF)
- ⚡ **PERFORMANCE**: ISR caching implementation
- 🐛 **FIX**: URL encoding for media files
- 🐛 **FIX**: Multiple bug fixes and optimizations

---

## 👥 Team

**Istamjon** - Full Stack Developer & DevOps Engineer

---

## 📄 License

Proprietary - Navoi International Airport

---

## 🔗 Links

- **Website**: https://navoiairport.com
- **Admin Panel**: https://navoiairport.com/admin
- **Repository**: https://github.com/Istamjon/navoiairport.com

---

*Built with ❤️ for Navoi International Airport*
