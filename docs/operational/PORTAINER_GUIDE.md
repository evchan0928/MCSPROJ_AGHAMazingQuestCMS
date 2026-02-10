# Portainer Setup & Management Guide

## ✅ Portainer is Now Running!

Your Portainer instance has been fixed and reinstalled successfully.

### Access Portainer
- **URL**: `https://100.93.255.84:9443`
- **Status**: Running (via Tailscale VPN)
- **Port Mapping**: `8001:8000 → 9443:9443` (port 8001 avoids conflict with backend on 8000)

---

## 🎯 First Time Setup

### Step 1: Access Portainer
1. Open your browser on a device connected to Tailscale
2. Navigate to: `https://100.93.255.84:9443`
3. You may see a certificate warning (self-signed SSL) - click "Continue" or "Proceed anyway"

### Step 2: Create Admin Account
1. On the setup page, create your admin username and password
2. Remember these credentials for future logins
3. Click "Create user"

### Step 3: Select Environment
1. The page will ask you to select an environment
2. Select **"Docker"** (not Kubernetes - you're not using that)
3. Click "Add" or "Connect"
4. Portainer will automatically detect your Docker engine

### Step 4: Dashboard
- You're now in Portainer!
- You can see all your containers, images, networks, and volumes

---

## 🚀 Using Portainer for Container Management

### View Running Containers
1. Left sidebar → **Containers**
2. You'll see:
   - `agha-postgres` (Database)
   - `agha-pgadmin4` (Database UI)
   - `agha-backend` (API Server)
   - `agha-frontend` (Web UI)
   - `portainer` (This app)

### View Container Logs
1. Click on a container name (e.g., `agha-backend`)
2. Scroll down to see **Logs** section
3. Logs update in real-time

### Monitor Container Stats
1. Click on a running container
2. See memory usage, CPU %, network I/O
3. Watch real-time performance metrics

### Restart a Container
1. Click on a container
2. Click **Restart** button at the top
3. Service will restart immediately

### Stop/Start Containers
1. From Containers list, click the ⚙️ icon next to a container
2. Select **Stop** or **Start**
3. Useful for maintenance

### View Container Inspect (Configuration)
1. Click container name
2. See environment variables, ports, volumes, networks
3. Verify configuration is correct

---

## 🐳 Managing Docker Resources

### View Images
1. Left sidebar → **Images**
2. See all Docker images installed
3. Pull new images from registry (e.g., Docker Hub)
4. Delete unused images to free disk space

### View Volumes
1. Left sidebar → **Volumes**
2. See:
   - `postgres_data` (Database storage)
   - `pgadmin_data` (PGAdmin settings)
   - `static_volume` (Django static files)
   - `media_volume` (User uploads)

### View Networks
1. Left sidebar → **Networks**
2. See `agha-network` (your services' Docker network)
3. View which containers are connected

---

## 📋 Deploy New Containers (Optional)

### Create a New Container
1. Left sidebar → **Containers**
2. Click **+ Add container**
3. Fill in:
   - **Name**: Choose a name (e.g., `my-app`)
   - **Image**: Docker image to use (e.g., `nginx:latest`)
   - **Ports**: Map host ports to container ports
   - **Volumes**: Mount storage if needed
   - **Environment**: Set environment variables
4. Click **Deploy container**

### Example: Deploy Nginx Web Server
1. Name: `test-nginx`
2. Image: `nginx:latest`
3. Ports: Host `8090` → Container `80`
4. Click Deploy
5. Access at `http://100.93.255.84:8090` via Tailscale

---

## 🔧 Advanced Features

### Stack Management
- Deploy multiple containers at once using docker-compose
- Left sidebar → **Stacks**
- Upload or paste your `docker-compose.yml` file
- Portainer will deploy all services together

### Access Control
- Left sidebar → **Users** (if admin)
- Create additional user accounts
- Assign roles (read-only, editor, admin)
- Useful for team environments

### App Templates
- Left sidebar → **App Templates**
- Browse pre-configured applications
- One-click deployment of popular services
- Great for quick experiments

---

## 🏥 Troubleshooting Portainer

### Portainer Won't Start
```bash
# Check container status
docker ps -a | grep portainer

# Check logs
docker logs portainer

# Restart
docker restart portainer

# Wait 5 seconds and check again
docker ps | grep portainer
```

### Can't Access HTTPS Page
1. Make sure you're using **HTTPS** (not HTTP)
2. URL should be: `https://100.93.255.84:9443`
3. Accept the self-signed certificate warning
4. Ensure Tailscale is active on your device

### Forgot Admin Password
```bash
# Remove and reinstall Portainer (loses settings)
docker rm portainer
docker volume rm portainer_data

# Create new volume and container
docker volume create portainer_data
docker run -d \
  -p 8001:8000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Wait 5 seconds, then access and create new admin account
```

### Can't See Your Containers/Images
1. Make sure you're logged in
2. Verify Docker is running: `docker ps`
3. Refresh the Portainer page (F5)
4. Check that you selected "Docker" environment during setup

---

## 📊 Common Portainer Tasks

| Task | Steps |
|------|-------|
| **View container logs** | Click container → Logs |
| **Restart container** | Click container → Restart button |
| **Stop container** | Click container → Stop |
| **Delete container** | Click ⋮ menu → Remove |
| **Update image** | Images → Pull new version → Recreate container |
| **Check disk usage** | Left sidebar scroll → System → Disk info |
| **Monitor stats** | Click container → Stats tab |
| **Backup PostgreSQL** | exec into postgres → pg_dump command (or use PGAdmin) |

---

## 🔐 Security Notes

✅ **What Portainer needs**:
- Access to Docker socket (`/var/run/docker.sock`)
- This gives full Docker control from web UI

✅ **Good practices**:
- Keep Portainer password strong
- Don't share Portainer URL outside your Tailscale network
- Regularly update Portainer image: `docker pull portainer/portainer-ce:latest`

⚠️ **Warning**:
- Portainer has full Docker access - treat it like root access
- Anyone with admin password can manage all containers
- Restrict Portainer access to trusted network members

---

## 🖼️ Quick Icon Guide (Portainer UI)

| Icon/Item | Meaning |
|-----------|---------|
| 🟢 Green circle | Container is running |
| 🔴 Red/Gray circle | Container is stopped |
| ⚙️ Gear icon | Container settings/options |
| ⋮ Three dots | More actions menu |
| 📊 Graph icon | Statistics/monitoring |
| 📝 Document icon | Logs/console output |
| 🗑️ Trash icon | Delete/remove |

---

## 📚 Resources

- Portainer Official Docs: https://docs.portainer.io
- Docker Docs: https://docs.docker.com
- Tailscale Docs: https://tailscale.com/kb/

---

**Your Portainer is ready to use! Access it at: `https://100.93.255.84:9443`**

Start by exploring your containers and monitoring your PostgreSQL database through PGAdmin.
