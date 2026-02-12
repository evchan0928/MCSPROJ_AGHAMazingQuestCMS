# Tailscale Remote Access Guide - AGHAMazingQuestCMS

## Your Server Setup (No Local Edits - Everything via Tailscale VPN)

Your complete application stack is now configured for remote access via Tailscale VPN. All services are containerized using Docker and accessible from anywhere through your Tailscale network.

### Server Information
- **Tailscale IP**: `100.93.255.84`
- **Tailscale Hostname**: `agham-cloud`
- **Network**: Private VPN network (no local port forwarding needed)

---

## 🌐 Service Access Points

### 1. **Frontend Application** (React)
- **URL**: `http://100.93.255.84:3000`
- **Purpose**: Web UI for the CMS
- **Container**: `agha-frontend`
- **Port**: 3000

### 2. **Backend API** (Django) — Wagtail removed
- **URL**: `http://100.93.255.84:8000`
- **Purpose**: REST API and admin panel
- **Container**: `agha-backend`
- **Port**: 8000
- **Endpoints**:
  - Admin: `http://100.93.255.84:8000/admin`
  - API: `http://100.93.255.84:8000/api`

### 3. **PGAdmin 4** (Database Management Web UI)
- **URL**: `http://100.93.255.84:5050`
- **Purpose**: PostgreSQL database management interface
- **Container**: `agha-pgadmin4`
- **Port**: 5050
- **Login Credentials** (from `.env`):
  - Email: `admin@aghama.com`
  - Password: `admin1234`

**First Time Setup in PGAdmin**:
1. Access `http://100.93.255.84:5050`
2. Login with credentials above
3. Click "Add New Server"
4. Configure connection:
   - **Name**: `Local PostgreSQL`
   - **Host**: `agha-postgres` (Docker container name)
   - **Port**: `5432` (container internal port)
   - **Username**: `admin`
   - **Password**: `password123`
   - **Save Password**: ✓

### 4. **PostgreSQL Database** (Direct Connection)
- **Host**: `100.93.255.84` (for external Tailscale access)
- **Port**: `5433` (mapped from container port 5432)
- **Database**: `aghamazing_db`
- **Username**: `admin`
- **Password**: `password123`

**Example Connection String**:
```
postgresql://admin:password123@100.93.255.84:5433/aghamazing_db
```

### 5. **Portainer** (Docker Management Web UI)
- **URL**: `https://100.93.255.84:9443`
- **Purpose**: Docker container and image management
- **Container**: `portainer`
- **Port**: 9443 (HTTPS only, no login required on first visit)

**First Time Setup**:
1. Access `https://100.93.255.84:9443`
2. Create admin username and password
3. Select "Docker" as environment
4. Manage all your containers from the web UI

---

## 📋 Running Containers Status

```bash
# Check running containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Expected output:
- `agha-postgres` - Up (Port: 5433→5432)
- `agha-pgadmin4` - Up (Port: 5050→80)
- `agha-backend` - Up (Port: 8000→8000)
- `agha-frontend` - Up (Port: 3000→3000)
- `portainer` - Up (Ports: 9443→9443, 8001→8000)

---

## 🛠️ Common Database Management Tasks via PGAdmin

### View Databases
1. Access PGAdmin: `http://100.93.255.84:5050`
2. Left panel → Servers → Local PostgreSQL → Databases
3. Click `aghamazing_db` to view tables and data

### Run SQL Queries
1. Right-click database → Query Tool
2. Write and execute SQL queries
3. Export results as needed

### Backup Database
1. Right-click `aghamazing_db` → Backup
2. Download backup file to your local machine

### Restore Database
1. Right-click database → Restore
2. Upload backup file from your machine

### Monitor Database Performance
1. Go to Tools → Server (in top menu)
2. View connections, cache, and performance metrics

---

## 🔧 Development Workflow (No Local Edits)

Since everything is running in Docker and accessible via Tailscale, your workflow is:

1. **Edit Code Remotely**: Use VS Code Remote SSH to connect to your server via Tailscale
   ```bash
   ssh apcadmin@100.93.255.84
   ```

2. **Make Changes in Container**: Edit files directly on the server within the Docker environment

3. **Restart Services**: Use Portainer web UI or Docker CLI
   ```bash
   docker restart agha-backend
   docker restart agha-frontend
   ```

4. **Monitor Logs**: Via Portainer or Docker CLI
   ```bash
   docker logs -f agha-backend
   docker logs -f agha-frontend
   ```

5. **Access Database**: Always through PGAdmin (`http://100.93.255.84:5050`)

---

## 🚀 Deployment & Docker Compose

### Start All Services (from your server)
```bash
cd /home/apcadmin/MCSPROJ_AGHAMazingQuestCMS
docker-compose -f devops/docker-compose-fullstack.yml up -d
```

### Stop All Services
```bash
docker-compose -f devops/docker-compose-fullstack.yml down
```

### View Logs
```bash
# All services
docker-compose -f devops/docker-compose-fullstack.yml logs -f

# Specific service
docker-compose -f devops/docker-compose-fullstack.yml logs -f backend
docker-compose -f devops/docker-compose-fullstack.yml logs -f frontend
```

### Rebuild after code changes
```bash
docker-compose -f devops/docker-compose-fullstack.yml up -d --build
```

---

## 🔐 Security Notes

✅ **What You Get with Tailscale**:
- Encrypted VPN connection (no port forwarding needed)
- Private network access only to added devices
- No exposure to public internet
- Zero configuration firewall (works behind any firewall)

⚠️ **Important Settings in `.env`**:
```
DB_HOST=100.93.255.84  # Your Tailscale IP
DB_PORT=5433           # Exposed port
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,100.93.255.84,agham-cloud
REACT_APP_BACKEND_API_URL=http://100.93.255.84:8000/api
```

---

## 🐛 Troubleshooting

### Can't Access PGAdmin?
1. Verify container is running: `docker ps | grep pgadmin`
2. Check Tailscale connection: `tailscale ip -4` (should show 100.93.255.84)
3. Try: `curl http://localhost:5050` (from server)
4. Try: `curl http://100.93.255.84:5050` (from Tailscale device)

### Can't Connect to Database from PGAdmin?
1. In PGAdmin, verify server configuration
2. Use hostname `agha-postgres` (not localhost or IP)
3. Use port `5432` (internal Docker port)
4. Check credentials: admin / password123

### Portainer Not Accessible?
1. Verify: `docker ps | grep portainer`
2. Try HTTPS: `https://100.93.255.84:9443`
3. Restart: `docker restart portainer`
4. Check logs: `docker logs portainer`

### Backend API Not Responding?
1. Check: `docker logs -f agha-backend`
2. Verify database connection in logs
3. Restart: `docker restart agha-backend`
4. Check `.env` file for correct credentials

---

## 📱 Access from Other Devices

To access your services from another device:

1. **Install Tailscale** on your device (phone, laptop, etc.)
2. **Sign in** with your Tailscale account
3. **Access services**:
   - Frontend: `http://100.93.255.84:3000`
   - Backend: `http://100.93.255.84:8000`
   - PGAdmin: `http://100.93.255.84:5050`
   - Portainer: `https://100.93.255.84:9443`

All traffic is encrypted through Tailscale VPN, no port forwarding required.

---

## 🔄 Regular Maintenance

### Database Backups (via PGAdmin)
- Schedule weekly backups through PGAdmin
- Export as `.backup` or `.sql` files
- Store backups on your Tailscale-accessible device

### Container Updates
- Check for new images: `docker pull <image_name>`
- Rebuild and restart: `docker-compose up -d --build`
- Monitor via Portainer dashboard

### Server Monitoring
- Use Portainer for container stats and logs
- Monitor database via PGAdmin Server Statistics
- Check disk space: `df -h`

---

## 🎯 Next Steps (Optional: For External Access)

If you want **external internet access** (not recommended without Cloudflare):
- Use Cloudflared Tunnel for HTTP/HTTPS services
- Reference: [Cloudflare Tunnel Setup] (see gist: homeserver-setup.md)
- This would allow access without Tailscale active

For now, Tailscale VPN is the secure, easy solution. No additional setup needed!

---

**Last Updated**: Feb 10, 2026
**Stack Version**: Docker Compose with Tailscale VPN
**Status**: ✅ All services running and accessible via Tailscale
