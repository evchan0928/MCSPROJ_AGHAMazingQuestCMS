# Quick Reference - Tailscale Service Access

## 🚀 Access Your Services

Your Tailscale IP: **100.93.255.84**

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| **Frontend** | `http://100.93.255.84:3000` | None | Web UI / CMS |
| **Backend API** | `http://100.93.255.84:8000` | Auth token | REST API |
| **Backend Admin** | `http://100.93.255.84:8000/admin` | Tailscale access | Django Admin |
| **PGAdmin 4** | `http://100.93.255.84:5050` | `admin@aghama.com` / `admin1234` | **Database GUI** ← Start Here! |
| **Portainer** | `https://100.93.255.84:9443` | Create on first login | Docker Management |

---

## 📊 Direct Database Access (for SQL tools)

```
Server:   100.93.255.84
Port:     5433
Database: aghamazing_db
User:     admin
Password: password123
```

---

## ⚙️ Container Status Check

```bash
# SSH to your server (requires Tailscale on your device)
ssh apcadmin@100.93.255.84

# Check all containers
docker ps

# View backend logs
docker logs -f agha-backend

# View frontend logs  
docker logs -f agha-frontend
```

---

## 🐘 PostgreSQL Cheat Sheet (via PGAdmin)

1. **Login**: `http://100.93.255.84:5050`
2. **View data**: Left sidebar → Servers → Local PostgreSQL → Databases → aghamazing_db → Tables
3. **Run SQL**: Right-click database → Query Tool
4. **Manage schema**: Browse tables, run migrations, create new tables

---

## 🔄 Restart Services

From your server (via SSH):

```bash
# Restart specific service
docker restart agha-backend      # Backend API
docker restart agha-frontend     # Frontend UI
docker restart agha-postgres     # Database
docker restart agha-pgadmin4     # PGAdmin
docker restart portainer         # Portainer

# Restart all
docker-compose -f devops/docker-compose-fullstack.yml restart
```

---

## ✅ Setup Complete - You Have:

- ✅ PostgreSQL database running
- ✅ PGAdmin 4 for database management (HTTP accessible)
- ✅ Django/Wagtail backend API
- ✅ React frontend application
- ✅ Portainer for container management
- ✅ Tailscale VPN for secure remote access
- ✅ **No port forwarding needed**
- ✅ **No local edits needed - everything is remote**

---

## 🌍 Access from Anywhere

1. Install Tailscale on any device (laptop, phone, tablet)
2. Sign in with your Tailscale account
3. Access all services using the URLs above
4. All traffic encrypted through VPN

---

**Everything is running. You can now manage your database with PGAdmin 4 via Tailscale!**
