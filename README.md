# Navoi International Airport Website (NIA) - Docker Environment

This repository contains the containerized version of the Navoi International Airport website built with **Payload CMS 3** and **Next.js 15**.

## 🚀 Quick Start (Docker)

To run the entire stack (Payload CMS + PostgreSQL Database) on your local machine, follow these steps:

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

### 2. Setup Environment Variables
Create a `.env` file in the root directory and add the following variables:
```env
DATABASE_URL=postgres://postgres:password@db:5432/final
PAYLOAD_SECRET=your_payload_secret_here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 3. Start the Containers
Run the following command in your terminal:
```bash
docker compose up -d
```
This will:
- Start a **PostgreSQL 17** database container.
- **Automatically Restore** the database from `final.sql` (using the `init-db.sh` script).
- Build and start the **Payload CMS** application.
- Mount your local `public/media` folder so all images are visible.

### 4. Access the Application
- **Website/Frontend**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠️ Project Structure & Configuration

### 📦 Database Restoration
The database is restored from `final.sql`. 
- **Important**: `final.sql` is a PostgreSQL Custom-Format Dump (`PGDMP`).
- Standard `psql` cannot read it. Instead, the `init-db.sh` script uses `pg_restore` to import the data into the `final` database during the first startup.

### 🖼️ Media Files
Images are stored in `public/media`. 
- In Docker, this folder is **bind-mounted** from your host machine to the container.
- This ensures that any images you have locally are immediately available in the CMS and on the website.

### 🔧 Build Process
The `Dockerfile` is optimized for Payload 3 and Next.js 15.
- It uses `pnpm` as the package manager.
- Static generation (`generateStaticParams`) is wrapped in `try-catch` blocks to ensure the build succeeds even if the database is not reachable during the image creation phase.

---

## 📖 Useful Commands

| Action | Command |
| :--- | :--- |
| **Start everything** | `docker compose up -d` |
| **Stop everything** | `docker compose down` |
| **View logs** | `docker compose logs -f payload` |
| **View DB logs** | `docker compose logs -f db` |
| **Rebuild application** | `docker compose build --no-cache` |
| **Reset Database** | `docker compose down -v` (Warning: deletes DB data) followed by `docker compose up -d` |

## 🤝 Support
If you have any issues with the Docker setup, please check the container logs using `docker logs final-payload-1`.
