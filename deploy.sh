#!/bin/bash
# ============================================================
# Mall of Cayman - VPS Deployment Script
# Domain: cloudtesting.cloud
# Hostinger VPS (Ubuntu 22.04+ recommended)
# ============================================================

set -e

DOMAIN="cloudtesting.cloud"
APP_DIR="/var/www/cloudtesting"
REPO_URL="https://github.com/Subrat053/MallofCayman.git"

echo "========================================="
echo "  Mall of Cayman - VPS Deployment"
echo "  Domain: $DOMAIN"
echo "========================================="

# ---- STEP 1: System Update & Prerequisites ----
echo "[1/10] Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "[1/10] Installing prerequisites..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw build-essential

# ---- STEP 2: Install Node.js 20 LTS ----
echo "[2/10] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# ---- STEP 3: Install PM2 ----
echo "[3/10] Installing PM2 globally..."
sudo npm install -g pm2

# ---- STEP 4: Firewall Setup ----
echo "[4/10] Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
echo "Firewall configured."

# ---- STEP 5: Clone/Update Repository ----
echo "[5/10] Setting up application directory..."
sudo mkdir -p $APP_DIR/logs
sudo chown -R $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
fi

# ---- STEP 6: Install Dependencies ----
echo "[6/10] Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production --legacy-peer-deps

echo "[6/10] Installing socket dependencies..."
cd $APP_DIR/socket
npm install --production

echo "[6/10] Installing frontend dependencies..."
cd $APP_DIR/frontend
npm install @material-ui/styles --legacy-peer-deps
npm install --legacy-peer-deps

# ---- STEP 7: Copy Production Environment Files ----
echo "[7/10] Setting up production environment..."

# Backend production .env
if [ -f "$APP_DIR/backend/config/.env.production" ]; then
    cp $APP_DIR/backend/config/.env.production $APP_DIR/backend/config/.env
    echo "Backend .env configured for production"
fi

# Socket production .env
if [ -f "$APP_DIR/socket/.env.production" ]; then
    cp $APP_DIR/socket/.env.production $APP_DIR/socket/.env
    echo "Socket .env configured for production"
fi

# ---- STEP 8: Build Frontend ----
echo "[8/10] Building frontend for production..."
cd $APP_DIR/frontend
npm run build
echo "Frontend build complete."

# ---- STEP 9: Setup Nginx ----
echo "[9/10] Configuring Nginx..."

# Copy Nginx config
sudo cp $APP_DIR/nginx/cloudtesting.cloud.conf /etc/nginx/sites-available/cloudtesting.cloud

# Enable the site
sudo ln -sf /etc/nginx/sites-available/cloudtesting.cloud /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
echo "Nginx configured and restarted."

# ---- STEP 10: SSL Certificate ----
echo "[10/10] Obtaining SSL certificate..."
# First, temporarily modify nginx for HTTP-only cert validation
sudo sed -i 's/listen 443 ssl http2;/#listen 443 ssl http2;/g' /etc/nginx/sites-available/cloudtesting.cloud
sudo sed -i 's/listen \[::]:443 ssl http2;/#listen [::]:443 ssl http2;/g' /etc/nginx/sites-available/cloudtesting.cloud
sudo nginx -t && sudo systemctl reload nginx 2>/dev/null || true

sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email subhankardash45585@gmail.com || {
    echo "SSL cert generation failed. Run manually: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}

# Restore full nginx config
sudo cp $APP_DIR/nginx/cloudtesting.cloud.conf /etc/nginx/sites-available/cloudtesting.cloud
sudo nginx -t && sudo systemctl reload nginx

# ---- Start Applications with PM2 ----
echo "Starting applications with PM2..."
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "  Domain: https://$DOMAIN"
echo "  Backend: http://localhost:8000"
echo "  Socket:  http://localhost:4000"
echo ""
echo "  PM2 Commands:"
echo "    pm2 status       - Check process status"
echo "    pm2 logs         - View logs"
echo "    pm2 restart all  - Restart all processes"
echo "    pm2 monit        - Monitor CPU/Memory"
echo ""
echo "  Useful Commands:"
echo "    sudo nginx -t && sudo systemctl reload nginx  - Reload Nginx"
echo "    sudo certbot renew --dry-run                  - Test SSL renewal"
echo ""
