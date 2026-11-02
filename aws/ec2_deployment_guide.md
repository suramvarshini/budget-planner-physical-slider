# AWS EC2 Ubuntu Production Deployment Guide

This guide documents deploying the **Budget Planner Physical Slider** application on an AWS EC2 Ubuntu LTS instance using Node.js, Nginx reverse proxy, and systemd / PM2.

---

## 1. Launch EC2 Instance

1. Navigate to **AWS Management Console > EC2 > Launch Instance**.
2. **Name**: `budget-planner-server`
3. **AMI**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type
4. **Instance Type**: `t3.micro` (or `t2.micro` eligible for Free Tier)
5. **Key Pair**: Select or create an RSA key pair (.pem) for SSH access.
6. **Security Group Rules**:
   - Inbound Port 22: SSH (restricted to your IP)
   - Inbound Port 80: HTTP (0.0.0.0/0)
   - Inbound Port 443: HTTPS (0.0.0.0/0)
   - Inbound Port 5000: *Internal only (behind Nginx)*

---

## 2. Server Environment Setup

Connect to your EC2 instance via SSH:
```bash
ssh -i "your-key.pem" ubuntu@ec2-xx-xx-xx-xx.compute-1.amazonaws.com
```

Update packages and install Node.js (v22+ or v24 LTS), Git, and Nginx:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v
npm -v
```

---

## 3. Clone Repository & Install Dependencies

```bash
git clone https://github.com/your-username/budget-planner-physical-slider.git /var/www/budget-planner
cd /var/www/budget-planner

# Configure Environment Variables
cp .env.example .env
nano .env # update PORT=5000, NODE_ENV=production

# Install Backend Dependencies & Seed DB
cd /var/www/budget-planner/backend
npm install --omit=dev
node src/db/seed.js

# Build Frontend Bundle
cd /var/www/budget-planner/frontend
npm install
npm run build
```

---

## 4. Configure Systemd Service for Backend

Create `/etc/systemd/system/budget-planner.service`:
```bash
sudo nano /etc/systemd/system/budget-planner.service
```

Paste the following configuration:
```ini
[Unit]
Description=Budget Planner Physical Slider Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/budget-planner/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable budget-planner
sudo systemctl start budget-planner
sudo systemctl status budget-planner
```

---

## 5. Configure Nginx Reverse Proxy & Static Hosting

Create Nginx site configuration:
```bash
sudo nano /etc/nginx/sites-available/budget-planner
```

```nginx
server {
    listen 80;
    server_name your-domain.com ec2-xx-xx-xx-xx.compute-1.amazonaws.com;

    # Frontend Single Page App (SPA)
    root /var/www/budget-planner/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/budget-planner /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL Configuration (Let's Encrypt Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
Certbot will automatically configure HTTPS redirect and TLS certificate renewals.
