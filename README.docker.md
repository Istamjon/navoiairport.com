# Docker Deployment Guide

## Quick Start

### Production Deployment

```bash
# 1. Create environment file
cp .env.docker.example .env

# 2. Edit .env and set your passwords
nano .env

# 3. Start services
docker-compose up -d --build

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f payload
```

### Development with Hot Reload

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Code changes will automatically reload
```

## Database Management

### Fresh Start (Empty Database)

The default configuration creates an empty PostgreSQL database. Payload CMS will automatically create tables on first run.

### Restore from Backup (Optional)

If you have a `final.sql` backup file:

```bash
# 1. Start database only
docker-compose up -d db

# 2. Wait for database to be healthy
docker-compose ps

# 3. Restore backup
chmod +x docker-restore-db.sh
./docker-restore-db.sh

# 4. Start application
docker-compose up -d payload
```

### Manual Database Restore

```bash
# Copy dump to container
docker cp final.sql navoiairport-db:/tmp/dump.sql

# Restore
docker exec navoiairport-db pg_restore -U postgres -d final --clean /tmp/dump.sql
```

## Useful Commands

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a service
docker-compose restart payload

# View logs
docker-compose logs -f payload
docker-compose logs -f db

# Check container status
docker-compose ps
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker exec -it navoiairport-db psql -U postgres -d final

# Create backup
docker exec navoiairport-db pg_dump -U postgres final > backup_$(date +%Y%m%d).sql

# Check database health
docker exec navoiairport-db pg_isready -U postgres
```

### Application Shell Access

```bash
# Access app container
docker exec -it navoiairport-app sh

# Access database container
docker exec -it navoiairport-db sh
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (⚠️ deletes all data)
docker-compose down -v

# Clean up Docker system
docker system prune -a
```

## Environment Variables

Create a `.env` file with:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=final

# Payload CMS
PAYLOAD_SECRET=your_32_character_secret_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## Troubleshooting

### Database won't start

```bash
# Check logs
docker-compose logs db

# Remove volume and start fresh
docker-compose down -v
docker-compose up -d
```

### Application can't connect to database

```bash
# Verify database is healthy
docker-compose ps

# Check connection string
docker-compose exec payload env | grep DATABASE_URL
```

### Out of memory

```bash
# Check resource usage
docker stats

# Adjust limits in docker-compose.yml
```

### Permission issues with media files

```bash
# Fix permissions
docker-compose exec payload chown -R nextjs:nodejs /app/public/media
```

## Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Set strong `PAYLOAD_SECRET` (min 32 characters)
- [ ] Configure proper `NEXT_PUBLIC_SERVER_URL`
- [ ] Set up SSL/TLS (use reverse proxy like Nginx)
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Review resource limits
- [ ] Enable firewall rules

## Architecture

```
┌─────────────────┐
│   Nginx/Caddy   │  (Optional reverse proxy)
│   Port 80/443   │
└────────┬────────┘
         │
┌────────▼────────┐
│  Payload App    │
│   Port 3000     │
│  (Next.js)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  PostgreSQL     │
│   Port 5432     │
│  (Database)     │
└─────────────────┘
```

## Performance Tips

1. **Use volumes for media** - Already configured
2. **Enable caching** - Redis can be added
3. **CDN for static assets** - Configure in production
4. **Database connection pooling** - Built into Payload
5. **Monitor resources** - Use `docker stats`

## Security Best Practices

1. ✅ Non-root user in containers
2. ✅ Network isolation
3. ✅ Resource limits
4. ✅ Health checks
5. ⚠️ Change default passwords
6. ⚠️ Use secrets management in production
7. ⚠️ Enable SSL/TLS
8. ⚠️ Regular security updates

## Support

For issues, check:
- Container logs: `docker-compose logs`
- Application health: `curl http://localhost:3000/api/health`
- Database health: `docker-compose exec db pg_isready`
