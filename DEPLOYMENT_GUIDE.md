# Mall of Cayman - VPS Deployment Guide
## Domain: cloudtesting.cloud | Hostinger VPS

---

## Prerequisites
- Hostinger VPS with Ubuntu 22.04+
- Domain `cloudtesting.cloud` pointed to VPS IP (A record)
- SSH access to the VPS
- Minimum: 2GB RAM, 1 vCPU, 20GB storage

---

## DNS Configuration (Hostinger DNS Zone)

Add these DNS records for `cloudtesting.cloud`:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `YOUR_VPS_IP` | 3600 |
| A | www | `YOUR_VPS_IP` | 3600 |
| CNAME | www | cloudtesting.cloud | 3600 |

---

## Quick Deploy (Automated)

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Download and run the deploy script
git clone https://github.com/Subrat053/MallofCayman.git /var/www/cloudtesting
cd /var/www/cloudtesting
chmod +x deploy.sh
./deploy.sh
```

---

## Manual Step-by-Step Deployment

### 1. System Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential
```

### 2. Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Should show v20.x.x
```

### 3. Install PM2
```bash
sudo npm install -g pm2
```

### 4. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 5. Clone Repository
```bash
sudo mkdir -p /var/www/cloudtesting/logs
sudo chown -R $USER:$USER /var/www/cloudtesting
git clone https://github.com/Subrat053/MallofCayman.git /var/www/cloudtesting
```

### 6. Install Dependencies
```bash
cd /var/www/cloudtesting/backend && npm install --production --legacy-peer-deps
cd /var/www/cloudtesting/socket && npm install --production
cd /var/www/cloudtesting/frontend && npm install --legacy-peer-deps
```

### 7. Configure Environment

**Backend** (`/var/www/cloudtesting/backend/config/.env`):
```bash
cp /var/www/cloudtesting/backend/config/.env.production /var/www/cloudtesting/backend/config/.env
```
Then edit with your real credentials:
```bash
nano /var/www/cloudtesting/backend/config/.env
```

**Socket** (`/var/www/cloudtesting/socket/.env`):
```bash
cp /var/www/cloudtesting/socket/.env.production /var/www/cloudtesting/socket/.env
```

### 8. Build Frontend
```bash
cd /var/www/cloudtesting/frontend
npm run build
```

### 9. Setup Nginx
```bash
sudo cp /var/www/cloudtesting/nginx/cloudtesting.cloud.conf /etc/nginx/sites-available/cloudtesting.cloud
sudo ln -sf /etc/nginx/sites-available/cloudtesting.cloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL Certificate
```bash
sudo certbot --nginx -d cloudtesting.cloud -d www.cloudtesting.cloud
```

### 11. Start with PM2
```bash
cd /var/www/cloudtesting
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Architecture (Production)

```
                    cloudtesting.cloud
                         |
                      Nginx (443)
                    /    |    \
                   /     |     \
    Frontend    API      |    Socket.io
   (static)   Proxy     |    WebSocket Proxy
   /build    :8000/api  |    :4000/socket.io
                         |
                      MongoDB Atlas
```

- **Nginx** handles SSL termination, static file serving, and reverse proxying
- **Backend (port 8000)** — Express API, accessed via `/api/v2/*`
- **Socket (port 4000)** — Socket.io server, accessed via `/socket.io/*`
- **Frontend** — React build served as static files at `/`

---

## PM2 Management Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check all process status |
| `pm2 logs` | View real-time logs |
| `pm2 logs backend` | View backend logs only |
| `pm2 logs socket` | View socket logs only |
| `pm2 restart all` | Restart all processes |
| `pm2 restart backend` | Restart backend only |
| `pm2 monit` | Real-time CPU/Memory monitor |
| `pm2 reload all` | Zero-downtime reload |

---

## Updating the Application

```bash
cd /var/www/cloudtesting
git pull origin main

# Backend changes
cd backend && npm install --production --legacy-peer-deps
pm2 restart backend

# Socket changes
cd ../socket && npm install --production
pm2 restart socket

# Frontend changes
cd ../frontend && npm install --legacy-peer-deps
npm run build
# No PM2 restart needed — Nginx serves static files
```

---

## Troubleshooting

### Backend won't start
```bash
pm2 logs backend --lines 50
# Check .env file is correct
cat /var/www/cloudtesting/backend/config/.env
```

### MongoDB connection issues
```bash
# Test from VPS
curl -s https://cloud.mongodb.com
# Ensure VPS IP is whitelisted in MongoDB Atlas
```

### SSL certificate renewal
```bash
sudo certbot renew --dry-run
# Auto-renewal via systemd timer (installed by certbot)
```

### Nginx errors
```bash
sudo nginx -t
sudo journalctl -u nginx --since "1 hour ago"
```

### Check running ports
```bash
sudo netstat -tlnp | grep -E '(8000|4000|80|443)'
```

---

## Security Checklist

- [x] HTTPS enforced (HTTP -> HTTPS redirect)
- [x] Security headers (X-Frame-Options, HSTS, etc.)
- [x] Rate limiting on API and login endpoints  
- [x] CORS restricted to domain only
- [x] Firewall (UFW) configured
- [x] PM2 process management with auto-restart
- [x] Environment variables for all secrets
- [x] Cookie httpOnly + secure + sameSite
- [ ] Change default JWT_SECRET_KEY to a strong random value
- [ ] Rotate Cloudinary credentials (they were in source code)
- [ ] Ensure MongoDB Atlas IP whitelist includes VPS IP
- [ ] Set up log rotation (`pm2 install pm2-logrotate`)
