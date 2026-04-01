# Navoi International Airport Rasmiy Veb-sayti (NIA) - Docker Muhiti

Ushbu loyiha **Payload CMS 3** va **Next.js 15** texnologiyalari asosida qurilgan Navoi Xalqaro Aeroportining rasmiy veb-saytidir. Ushbu repo loyihani Docker konteynerlarida to'liq professional tarzda ishga tushirish uchun mo'ljallangan.

---

## 🚀 Tizimni Ishga Tushirish (Qadam-baqadam)

Loyihani o'z kompyuteringizda (kod yozmasdan, faqat Docker orqali) ishga tushirish uchun quyidagi ko'rsatmalarga amal qiling:

### 1-qadam: Zaruriy dasturlar
Kompyuteringizda quyidagi dasturlar o'rnatilgan bo'lishi shart:
- **Docker Desktop** (ishga tushirilgan bo'lishi kerak).
- **Git** (kodlarni yuklab olish uchun).

### 2-qadam: Loyihani yuklab olish
Terminalda (CMD yoki PowerShell) quyidagi buyruqni bering:
```bash
git clone https://github.com/Istamjon/navoiairport.com.git
cd navoiairport.com
```

### 3-qadam: Muhit o'zgaruvchilarini sozlash (.env)
Loyiha ildiz papkasida (root) yangi `.env` faylini yarating va unga quyidagi kodni nusxalab qo'ying:
```env
DATABASE_URL=postgres://postgres:password@db:5432/final
PAYLOAD_SECRET=ecce34137f3d0597a6e70f6b
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```
*(Eslatma: `PAYLOAD_SECRET` xavfsizlik uchun faoliyat davomida o'zgartirilishi mumkin).*

### 4-qadam: Docker konteynerlarini ko'tarish
Terminalda quyidagi buyruqni bering:
```bash
docker compose up -d
```
Ushbu buyruq bajarilganda:
1. **PostgreSQL 17** bazasi avtomatik yaratiladi.
2. **`init-db.sh`** skripti ishga tushib, `final.sql` (PGDMP) faylini bazaga import qiladi.
3. **Payload CMS** ilovasi build qilinadi va ishga tushadi.
4. **`public/media`** papkasi bog'lanadi (rasmlar ko'rinishi uchun).

### 5-qadam: Saytni tekshirish
Hammasi tayyor bo'lgach, brauzeringizda quyidagi manzillarni oching:
- **Veb-sayt (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Texnik Ma'lumotlar va Imkoniyatlar

### 📦 Ma'lumotlar Bazasini Import Qilish
Sizning `final.sql` faylingiz oddiy SQL emas, balki **Binary Format (PGDMP)** hisoblanadi. Biz uni tiklash uchun maxsus `init-db.sh` skriptidan foyalandik. Bu skript bazaga ulanib, barcha jadval va ma'lumotlarni (`pg_restore` yordamida) to'liq tiklaydi.

### 🖼️ Media Fayllar (Rasmlar)
Rasmlar yo'qolib qolmasligi uchun loyihada **Bind Mount** usuli qo'llanilgan. Ya'ni, sizning kompyuteringizdagi `public/media` papkasi konteyner ichidagi media papkasi bilan to'g'ridan-to'g'ri bog'langan. Rasmlarni qo'shsangiz yoki o'chirsangiz, o'zgarishlar darhol saytda aks etadi.

### ⚡ Build Optimizatsiyasi
Docker build jarayoni Next.js 15 standalone rejimida ishlaydi. Bazaga ulanish build vaqtida imkonsiz bo'lganligi sababli, `generateStaticParams` funksiyalari `try-catch` bilan himoyalangan, bu esa build'ni uzluksiz yakunlashga yordam beradi.

---

## 📖 Tezkor Docker Buyruqlari

| Vazifa | Buyruq |
| :--- | :--- |
| **Tizimni ishga tushirish** | `docker compose up -d` |
| **Tizimni to'xtatish** | `docker compose down` |
| **Sayt loglarini ko'rish** | `docker compose logs -f payload` |
| **Baza loglarini ko'rish** | `docker compose logs -f db` |
| **Ilovani qayta build qilish** | `docker compose build --no-cache` |
| **Bazani butunlay tozalash** | `docker compose down -v` |

---

## 🆘 Muammolarni Hal Qilish (Troubleshooting)

Agarda rasmlar ko'rinmasa yoki sayt ochilmasa:
1. Docker Desktop ishlayotganiga ishonch hosil qiling.
2. `docker compose logs -f payload` buyrug'i orqali xatolarni tekshiring.
3. `.env` faylidagi `DATABASE_URL` xatolarsiz yozilganligini tekshiring.

---
*Loyiha Istamjon / Navoiairport.com jamoasi uchun maxsus tayyorlandi.*
