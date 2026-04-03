# Database Import Qo'llanmasi

## 🔍 Muammo

Docker ishga tushganda `final.sql` fayli avtomatik import qilinmadi.

---

## ✅ Yechim

### Variant 1: Avtomatik Import (Yangi Container)

Agar container yangi yaratilayotgan bo'lsa, `init-db.sh` avtomatik ishlaydi:

```bash
# 1. Barcha containerlarni to'xtatish va ma'lumotlarni o'chirish
docker-compose down -v

# 2. Qayta ishga tushirish (init-db.sh avtomatik ishlaydi)
docker-compose up -d --build

# 3. Loglarni kuzatish
docker-compose logs -f db
```

**Eslatma**: `-v` flag barcha volume'larni o'chiradi, shu jumladan mavjud ma'lumotlarni ham!

---

### Variant 2: Manual Import (Mavjud Container)

Agar container allaqachon ishlab turibgan bo'lsa:

```bash
# Script orqali (tavsiya etiladi)
chmod +x docker-restore-db.sh
./docker-restore-db.sh
```

**Yoki manual:**

```bash
# 1. Database ishga tushganini tekshirish
docker-compose ps

# 2. Dump faylni container'ga ko'chirish
docker cp final.sql navoiairport-db:/tmp/final.dump

# 3. Restore qilish
docker exec navoiairport-db pg_restore \
  -U postgres \
  -d final \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  /tmp/final.dump

# 4. Natijani tekshirish
docker exec navoiairport-db psql -U postgres -d final -c "\dt"
```

---

### Variant 3: SQL Format (Agar final.sql oddiy SQL bo'lsa)

```bash
# Agar fayl oddiy SQL format bo'lsa
docker exec -i navoiairport-db psql -U postgres -d final < final.sql
```

---

## 🔍 Tekshirish

### Database'da table'lar borligini tekshirish:

```bash
# Barcha table'larni ko'rish
docker exec navoiairport-db psql -U postgres -d final -c "\dt"

# Ma'lumotlar sonini tekshirish
docker exec navoiairport-db psql -U postgres -d final -c "SELECT COUNT(*) FROM pages;"
docker exec navoiairport-db psql -U postgres -d final -c "SELECT COUNT(*) FROM posts;"
docker exec navoiairport-db psql -U postgres -d final -c "SELECT COUNT(*) FROM media;"
```

---

## 📋 Init-db.sh Qanday Ishlaydi

`init-db.sh` fayli faqat **birinchi marta** container yaratilganda ishlaydi:

1. PostgreSQL container ishga tushadi
2. `POSTGRES_DB` environment variable orqali `final` database yaratiladi
3. `/docker-entrypoint-initdb.d/` papkadagi barcha skriptlar ishga tushadi
4. `init-db.sh` `/tmp/final.dump` faylni restore qiladi

**Muhim**: Agar volume allaqachon mavjud bo'lsa, init skriptlar **ishlamaydi**!

---

## 🔧 docker-compose.yml O'zgarishlari

Yangilangan konfiguratsiya:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - ./init-db.sh:/docker-entrypoint-initdb.d/init-db.sh:ro
  - ./final.sql:/tmp/final.dump:ro
```

- `:ro` = read-only (xavfsizlik uchun)
- `init-db.sh` → `/docker-entrypoint-initdb.d/` (avtomatik ishga tushadi)
- `final.sql` → `/tmp/final.dump` (restore uchun)

---

## ⚠️ Muhim Eslatmalar

1. **Birinchi ishga tushirish**: `init-db.sh` faqat yangi volume'da ishlaydi
2. **Mavjud ma'lumotlar**: Agar database allaqachon to'ldirilgan bo'lsa, `--clean` flag eski ma'lumotlarni o'chiradi
3. **Backup**: Import qilishdan oldin mavjud ma'lumotlarni backup qiling
4. **Format**: `final.sql` PostgreSQL custom format (PGDMP) bo'lishi kerak

---

## 🚀 Tezkor Yechim

```bash
# Agar hozir import qilish kerak bo'lsa:
./docker-restore-db.sh

# Yoki yangi container yaratish:
docker-compose down -v && docker-compose up -d --build
```

---

## 📊 Natijani Tekshirish

```bash
# 1. Container statusini ko'rish
docker-compose ps

# 2. Database loglarini ko'rish
docker-compose logs db | grep -i "restore\|error"

# 3. Table'lar ro'yxatini olish
docker exec navoiairport-db psql -U postgres -d final -c "\dt"

# 4. Saytni ochish
# http://localhost:3000
```

---

**Muvaffaqiyatli import! 🎉**
