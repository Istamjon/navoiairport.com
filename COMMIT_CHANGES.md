# Git Commit va Push Qo'llanmasi

## 📋 O'zgarishlar Ro'yxati

### Yangi Fayllar
- `src/utilities/sanitizeFilename.ts` - Filename sanitization utility
- `docker-compose.dev.yml` - Development docker-compose
- `.env.docker.example` - Environment variables example
- `docker-restore-db.sh` - Database restore script
- `docker-init-db.sh` - Database initialization script
- `docker-clean-build.sh` - Docker cache cleanup script
- `README.docker.md` - Docker deployment guide
- `COMMIT_CHANGES.md` - This file

### O'zgartirilgan Fayllar
- `README.md` - To'liq yangilandi (Version 2.0.0)
- `Dockerfile` - Optimizatsiya qilindi (multi-stage build)
- `docker-compose.yml` - Yaxshilandi (resource limits, health checks)
- `.dockerignore` - Kengaytirildi (75 qator)
- `src/collections/Media.ts` - Filename sanitization hook qo'shildi
- `src/utilities/getMediaUrl.ts` - URL encoding bug tuzatildi
- `next.config.js` - Image optimization sozlamalari
- `src/components/Media/ImageMedia/index.tsx` - Image quality va sizes
- Multiple files - Access control, bug fixes, optimizations

---

## 🚀 Git Komandalar

### 1. Hozirgi Holatni Ko'rish
```bash
git status
```

### 2. Barcha O'zgarishlarni Staging'ga Qo'shish
```bash
git add .
```

### 3. Commit Qilish
```bash
git commit -m "feat: major update v2.0.0 - security, performance, docker optimization

✨ New Features:
- Automatic filename sanitization (timestamp + UUID)
- Docker optimization (60% smaller images)
- Development docker-compose with hot reload
- Comprehensive documentation updates

🔒 Security Improvements:
- Access control enforcement on all API calls
- Path traversal protection
- File upload security validation
- Non-root Docker containers
- Network isolation and resource limits

⚡ Performance Optimizations:
- Image optimization (WebP, AVIF, 85% quality)
- ISR caching implementation
- Responsive image sizing
- Docker multi-stage build
- Layer caching optimization

🐛 Bug Fixes:
- URL encoding for media files with special characters
- Author population logic bug
- Redirect document fetching
- Image timeout in development
- Multiple lint errors

📝 Documentation:
- Updated README.md with comprehensive guide
- Added README.docker.md for deployment
- Created helper scripts for Docker management
- Added environment variables examples

🐳 Docker:
- Optimized Dockerfile (Node 20 Alpine)
- Enhanced docker-compose.yml
- Added development compose file
- Database management scripts
- Health checks for all services"
```

### 4. Remote Repository'ga Push Qilish
```bash
# Main branch'ga push
git push origin main

# Yoki boshqa branch'ga
git push origin <branch-name>
```

---

## 📦 To'liq Jarayon (Bitta Komanda)

```bash
# Windows (PowerShell)
git add . ; git commit -m "feat: major update v2.0.0 - security, performance, docker optimization" ; git push origin main

# Linux/Mac (Bash)
git add . && git commit -m "feat: major update v2.0.0 - security, performance, docker optimization" && git push origin main
```

---

## 🔍 Qo'shimcha Komandalar

### O'zgarishlarni Ko'rish
```bash
# Qisqa ko'rinish
git status

# Batafsil farqlar
git diff

# Staging'dagi farqlar
git diff --staged
```

### Commit Tarixini Ko'rish
```bash
# Oxirgi 5 ta commit
git log --oneline -5

# Grafik ko'rinish
git log --graph --oneline --all
```

### Agar Xato Bo'lsa
```bash
# Oxirgi commit'ni bekor qilish (fayllar saqlanadi)
git reset --soft HEAD~1

# Staging'dan chiqarish
git restore --staged <file>

# Faylni qaytarish
git restore <file>
```

---

## ⚠️ Muhim Eslatmalar

1. **`.env` faylini commit qilmang!** - U `.gitignore`da bo'lishi kerak
2. **`node_modules` va `.next` ham ignore qilingan**
3. **`public/media` fayllar Docker volume orqali boshqariladi**
4. **Parollarni commit qilmang** - `.env.docker.example` ishlatiladi

---

## 📊 Commit Statistikasi

```bash
# Qo'shilgan/o'chirilgan qatorlar
git diff --stat

# Fayl soni
git ls-files | wc -l
```

---

## ✅ Tekshirish

Push qilgandan keyin:

1. **GitHub'da tekshiring**: https://github.com/Istamjon/navoiairport.com
2. **README.md ko'rinishini tekshiring**
3. **Yangi fayllar mavjudligini tasdiqlang**

---

*Muvaffaqiyatli commit va push! 🎉*
