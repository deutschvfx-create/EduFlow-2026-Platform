# EduFlow Deployment Guide - Hetzner VPS

Complete guide for deploying EduFlow to a Hetzner VPS with Ubuntu 24.04.

---

## 📋 Prerequisites

### Server Requirements
- **OS:** Ubuntu 24.04 LTS
- **CPU:** 2+ cores recommended
- **RAM:** 4GB+ recommended
- **Storage:** 20GB+ SSD
- **Network:** Public IP address

### Required Software
- Node.js 20.x LTS
- PM2 (process manager)
- Nginx (reverse proxy)
- Git

---

## 🚀 Initial Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20.x

```bash
# Install Node.js 20.x from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 3. Install PM2

```bash
sudo npm install -g pm2

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown
```

### 4. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install Git

```bash
sudo apt install -y git
```

---

## 📦 Application Setup

### 1. Create Application User (Optional but Recommended)

```bash
sudo adduser eduflow
sudo usermod -aG sudo eduflow
su - eduflow
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/your-username/eduflow-2026.git
cd eduflow-2026
```

### 3. Install Dependencies

```bash
npm ci --production=false
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Required variables:**

```env
# Public (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_MASTER_ADMIN_UID=your_admin_uid

# Private (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=sk-proj-your_key
RESEND_API_KEY=re_your_key
MASTER_ADMIN_UID=your_admin_uid
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### 5. Build Production Bundle

```bash
npm run build
```

**Expected output:**
- Build completes successfully
- `.next/standalone` folder is created
- No errors in console

### 6. Create Logs Directory

```bash
mkdir -p logs
```

---

## 🔧 Nginx Configuration

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/eduflow
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # Static files (Next.js handles these, but good to have)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/eduflow /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically update your Nginx config
```

---

## 🚀 Start Application

### 1. Start with PM2

```bash
cd ~/eduflow-2026
pm2 start ecosystem.config.js
```

### 2. Save PM2 Configuration

```bash
pm2 save
```

### 3. Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs eduflow --lines 50

# Test health endpoint
curl http://localhost:3000/api/health
```

**Expected health check response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T18:27:42Z",
  "uptime": 123.45,
  "firestore": "connected",
  "responseTime": "45ms",
  "environment": "production"
}
```

---

## 🔄 Deployment Process

### Automated Deployment

```bash
cd ~/eduflow-2026
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm ci --production=false

# 3. Build
npm run build

# 4. Reload PM2 (zero-downtime)
pm2 reload ecosystem.config.js --update-env
```

---

## 📊 Monitoring

### PM2 Commands

```bash
# View status
pm2 status

# View logs (real-time)
pm2 logs eduflow

# View logs (last 100 lines)
pm2 logs eduflow --lines 100

# Monitor resources
pm2 monit

# Restart application
pm2 restart eduflow

# Stop application
pm2 stop eduflow

# Delete from PM2
pm2 delete eduflow
```

### Health Check

```bash
# Local check
curl http://localhost:3000/api/health

# Public check
curl https://yourdomain.com/api/health
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔧 Troubleshooting

### Application Won't Start

**Check PM2 logs:**
```bash
pm2 logs eduflow --err
```

**Common issues:**
- Missing environment variables → Check `.env.production`
- Port 3000 already in use → `sudo lsof -i :3000`
- Build failed → Run `npm run build` manually

### Firestore Connection Issues

**Verify environment variables:**
```bash
pm2 logs eduflow | grep FIREBASE
```

**Test Firebase Admin SDK:**
```bash
# Check if private key is formatted correctly
node -e "console.log(process.env.FIREBASE_PRIVATE_KEY)" | head -1
```

### Nginx 502 Bad Gateway

**Check if Next.js is running:**
```bash
pm2 status
curl http://localhost:3000/api/health
```

**Check Nginx error logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

### High Memory Usage

**Check PM2 memory:**
```bash
pm2 monit
```

**Restart if needed:**
```bash
pm2 restart eduflow
```

**Adjust memory limit in `ecosystem.config.js`:**
```javascript
max_memory_restart: '2G'  // Increase if needed
```

---

## 🔒 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] SSL certificate installed
- [ ] Environment variables secured (not in Git)
- [ ] Regular system updates scheduled
- [ ] PM2 logs rotated
- [ ] Nginx security headers configured
- [ ] Fail2ban installed (optional)

### Setup UFW Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 📝 Maintenance

### Update Application

```bash
cd ~/eduflow-2026
./deploy.sh
```

### Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Renew SSL Certificate

```bash
# Certbot auto-renews, but you can test:
sudo certbot renew --dry-run
```

### Backup

**Backup environment variables:**
```bash
cp .env.production .env.production.backup
```

**Note:** Firestore data is automatically backed up by Firebase.

---

## 🆘 Emergency Rollback

### Rollback to Previous Version

```bash
cd ~/eduflow-2026

# Find previous commit
git log --oneline -5

# Rollback
git checkout <previous-commit-hash>

# Rebuild and restart
npm ci
npm run build
pm2 reload ecosystem.config.js
```

### Restore from Backup

```bash
# Restore environment variables
cp .env.production.backup .env.production

# Restart
pm2 restart eduflow
```

---

## 📞 Support

For issues:
1. Check PM2 logs: `pm2 logs eduflow`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Test health endpoint: `curl http://localhost:3000/api/health`
4. Review this guide's troubleshooting section
