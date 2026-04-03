# Line Ending Muammosini Hal Qilish

## 🔴 Muammo

```
/bin/bash^M: bad interpreter: No such file or directory
```

Bu Windows line ending (CRLF) muammosi. Linux container Unix line ending (LF) kutadi.

---

## ✅ Yechim

### Variant 1: Git orqali (Tavsiya etiladi)

`.gitattributes` faylini yarating:

```bash
# .gitattributes yaratish
echo "*.sh text eol=lf" > .gitattributes

# Git cache'ni tozalash
git rm --cached -r .
git reset --hard
```

### Variant 2: dos2unix (Linux/Mac)

```bash
# dos2unix o'rnatish
# Ubuntu/Debian:
sudo apt-get install dos2unix

# Mac:
brew install dos2unix

# Konvertatsiya qilish
dos2unix init-db.sh
dos2unix docker-restore-db.sh
dos2unix docker-clean-build.sh
```

### Variant 3: VS Code orqali

1. `init-db.sh` faylini oching
2. Pastki o'ng burchakda `CRLF` yozuvini bosing
3. `LF` ni tanlang
4. Faylni saqlang

### Variant 4: PowerShell orqali (Windows)

```powershell
# PowerShell script
$files = @(
    "init-db.sh",
    "docker-restore-db.sh", 
    "docker-clean-build.sh"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($file, $content)
        Write-Host "Fixed: $file"
    }
}
```

---

## 🔄 Database'ni Qayta Yaratish

Line ending tuzatilgandan keyin:

```bash
# 1. Containerlarni to'xtatish va volume o'chirish
docker-compose down -v

# 2. Qayta ishga tushirish
docker-compose up -d --build

# 3. Loglarni kuzatish
docker-compose logs -f db

# 4. Natijani tekshirish
docker exec navoiairport-db psql -U postgres -d final -c "\dt"
```

---

## ✅ Muvaffaqiyatli Import Belgisi

Logda ko'rishingiz kerak:

```
navoiairport-db  | Restoring database from custom-format dump...
navoiairport-db  | Restore complete.
```

---

## 🔍 Tekshirish

```bash
# Table'lar mavjudligini tekshirish
docker exec navoiairport-db psql -U postgres -d final -c "\dt"

# Ma'lumotlar soni
docker exec navoiairport-db psql -U postgres -d final -c "
SELECT COUNT(*) as pages_count FROM pages;
"
```

---

## 📝 .gitattributes (Kelajakda Oldini Olish)

Loyiha root'ida `.gitattributes` yarating:

```
# Shell scripts should always use LF
*.sh text eol=lf

# Batch files should use CRLF
*.bat text eol=crlf
*.cmd text eol=crlf

# Default behavior
* text=auto
```

Bu kelajakda Windows'da ham to'g'ri line ending'larni ta'minlaydi.

---

**Muvaffaqiyatli tuzatish! 🎉**
