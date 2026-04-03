# 🐳 Professional Docker Deployment Guide
## Navoi International Airport

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Database Management](#database-management)
6. [Media Files](#media-files)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Production Checklist](#production-checklist)

---

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Make script executable
chmod +x docker-setup.sh

# Run automated setup
./docker-setup.sh
```

### Manual Setup

```bash
# 1. Create environment file
cp .env.production.example .env
# Edit .env with your values

# 2. Build and start
docker-compose up -d --build

# 3. Import database (if you have final.sql)
docker cp final.sql navoiairport-db:/tmp/final.dump
docker exec navoiairport-db sh -c "pg_restore -U postgres -d final --clean --if-exists --no-owner --no-privileges /tmp/final.dump"

# 4. Access application
# http://localhost:3000
```

---

## 📦 Prerequisites

### Required Software

- **Docker Desktop** 20.10+
- **Docker Compose** 2.0+
- **Git** (for version control)

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **OS**: Windows 10/11, macOS, or Linux

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=final

# Payload CMS
PAYLOAD_SECRET=your_32_character_secret_key_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Node
NODE_ENV=production
```

### Important Security Notes

1. **Change default passwords** - Never use default values in production
2. **PAYLOAD_SECRET** - Must be 32+ characters, random string
3. **Database password** - Use strong password (16+ characters)
4. **Never commit .env** - Already in .gitignore

---

## 🚢 Deployment

### Development Mode

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Code changes will auto-reload
```

### Production Mode

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Scaling

```bash
# Scale application (requires load balancer)
docker-compose up -d --scale payload=3
```

---

## 💾 Database Management

### Backup Database

```bash
# Create backup
docker exec navoiairport-db pg_dump -U postgres final > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use custom format
docker exec navoiairport-db pg_dump -U postgres -Fc final > backup.dump
```

### Restore Database

```bash
# From SQL file
docker exec -i navoiairport-db psql -U postgres -d final < backup.sql

# From custom format
docker cp backup.dump navoiairport-db:/tmp/backup.dump
docker exec navoiairport-db pg_restore -U postgres -d final --clean /tmp/backup.dump
```

### Database Migrations

```bash
# Run migrations
docker exec navoiairport-app pnpm payload migrate

# Create new migration
docker exec navoiairport-app pnpm payload migrate:create
```

### Access Database

```bash
# PostgreSQL CLI
docker exec -it navoiairport-db psql -U postgres -d final

# Useful queries
\dt                    # List tables
\d+ table_name        # Describe table
SELECT COUNT(*) FROM pages;
```

---

## 🖼️ Media Files

### How Media Works

Media files are stored in `./public/media` on your host machine and mounted into the container. This ensures:

- ✅ Files persist across container restarts
- ✅ Easy backup and management
- ✅ No data loss when updating containers

### Media Directory Structure

```
public/media/
├── .gitkeep          # Keeps directory in git
├── image1.jpg        # Uploaded images
├── document.pdf      # Uploaded documents
└── ...
```

### Backup Media Files

```bash
# Create media backup
tar -czf media_backup_$(date +%Y%m%d).tar.gz public/media/

# Restore media backup
tar -xzf media_backup_20260403.tar.gz
```

### Media Permissions

```bash
# Fix permissions if needed
docker exec navoiairport-app chown -R nextjs:nodejs /app/public/media
docker exec navoiairport-app chmod -R 755 /app/public/media
```

---

## 📊 Monitoring

### Container Status

```bash
# View all containers
docker-compose ps

# View resource usage
docker stats

# View logs
docker-compose logs -f payload
docker-compose logs -f db
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker exec navoiairport-db pg_isready -U postgres
```

### Performance Metrics

```bash
# Container resource usage
docker stats navoiairport-app navoiairport-db

# Database connections
docker exec navoiairport-db psql -U postgres -d final -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔧 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs db
docker-compose logs payload

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build --force-recreate
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker exec navoiairport-db pg_isready -U postgres
```

### Port Already in Use

```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Stop local dev server or change port in docker-compose.yml
```

### Media Files Not Loading

```bash
# Check if media directory is mounted
docker exec navoiairport-app ls -la /app/public/media

# Fix permissions
docker exec navoiairport-app chown -R nextjs:nodejs /app/public/media

# Restart container
docker-compose restart payload
```

### Out of Memory

```bash
# Increase memory limits in docker-compose.yml
# Under payload service:
deploy:
  resources:
    limits:
      memory: 4G  # Increase from 2G
```

### Slow Performance

```bash
# Clean Docker cache
docker system prune -a

# Optimize database
docker exec navoiairport-db psql -U postgres -d final -c "VACUUM ANALYZE;"

# Check resource usage
docker stats
```

---

## ✅ Production Checklist

### Before Deployment

- [ ] Change all default passwords
- [ ] Set strong PAYLOAD_SECRET (32+ characters)
- [ ] Configure proper NEXT_PUBLIC_SERVER_URL
- [ ] Review resource limits in docker-compose.yml
- [ ] Set up SSL/TLS (use reverse proxy)
- [ ] Configure backup strategy
- [ ] Test database restore procedure
- [ ] Set up monitoring and alerts
- [ ] Configure firewall rules
- [ ] Review security settings

### Security Best Practices

1. **Use environment-specific secrets**
   - Don't use same secrets in dev/prod
   - Use secrets management (Docker Secrets, Vault)

2. **Enable SSL/TLS**
   - Use Nginx or Caddy as reverse proxy
   - Get free SSL from Let's Encrypt

3. **Regular backups**
   - Automated daily database backups
   - Weekly media file backups
   - Test restore procedures

4. **Update regularly**
   - Keep Docker images updated
   - Update dependencies monthly
   - Monitor security advisories

5. **Network security**
   - Don't expose database port publicly
   - Use firewall rules
   - Enable Docker network isolation

### Recommended Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name navoiairport.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📞 Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues
4. Contact development team

---

## 📝 Version History

- **v2.0.0** (2026-04-03) - Professional Docker setup
  - Optimized multi-stage build
  - Proper media volume mounting
  - Comprehensive documentation
  - Automated setup script
  - Production-ready configuration

---

*Built with ❤️ for Navoi International Airport*
