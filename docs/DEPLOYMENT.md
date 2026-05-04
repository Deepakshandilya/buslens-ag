# BusLens — Production Deployment on AWS

A full-stack deployment of BusLens using EC2, RDS, Nginx, and GitHub Actions CI/CD.

---

## Architecture

```
User (Browser)
    ↓
DNS  (buslens.live → EC2 Public IP)
    ↓
Nginx (Port 80 → redirect, Port 443 → SSL termination)
    ├── /      → Next.js   (localhost:3000, managed by PM2)
    └── /api/  → FastAPI   (localhost:8000, managed by systemd + Gunicorn)
    ↓
AWS RDS MySQL  (private subnet, not publicly accessible)
```

### Infrastructure

| Component | Service | Role |
|-----------|---------|------|
| Compute | AWS EC2 (Ubuntu 22.04) | Hosts both frontend and backend |
| Database | AWS RDS (MySQL) | Persistent route and stop data |
| Reverse Proxy | Nginx | SSL termination, routing |
| Backend process | systemd + Gunicorn | Keeps FastAPI running, restarts on crash |
| Frontend process | PM2 | Keeps Next.js running, survives reboots |
| SSL | Let's Encrypt (Certbot) | HTTPS certificates, auto-renewal |
| CI/CD | GitHub Actions | Auto-deploy on push to main |

---

## EC2 Setup

### Instance Configuration

- OS: Ubuntu 22.04 LTS
- Instance type: t3.micro
- Security group inbound rules: 22 (SSH), 80 (HTTP), 443 (HTTPS)

Ports 3000 and 8000 are intentionally not exposed publicly — all external traffic routes through Nginx.

### System Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx python3-pip python3-venv git
```

### Node.js

Ubuntu's default Node.js package is outdated. Install Node 20 via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Memory — Swap File

t3.micro has 1GB RAM. Next.js production builds require more. A swap file prevents build crashes:

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

To persist across reboots, add to `/etc/fstab`:
```
/swapfile swap swap defaults 0 0
```

---

## Backend (FastAPI + Gunicorn)

### Setup

```bash
cd ~/buslens-ag/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install "uvicorn[standard]" gunicorn
```

### systemd Service

Gunicorn is managed by systemd so it starts on boot and restarts automatically on crash.

`/etc/systemd/system/fastapi.service`:

```ini
[Unit]
Description=BusLens FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/buslens-ag/backend
ExecStart=/home/ubuntu/buslens-ag/backend/venv/bin/gunicorn \
    -w 2 \
    -k uvicorn.workers.UvicornWorker \
    app.main:app \
    --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable fastapi
sudo systemctl start fastapi
```

Use the full path to Gunicorn inside the venv — not the system-level binary.

Check status:
```bash
sudo systemctl status fastapi
sudo journalctl -u fastapi -n 50
```

---

## Frontend (Next.js + PM2)

### Build

```bash
cd ~/buslens-ag/frontend
npm ci
npm run build
```

### PM2 Process Manager

```bash
sudo npm install -g pm2
pm2 start npm --name "nextjs" -- start
pm2 save
pm2 startup
```

`pm2 save` persists the process list. `pm2 startup` generates a systemd unit so PM2 itself survives reboots.

For zero-downtime deploys, use:
```bash
pm2 reload nextjs
```

---

## Nginx Configuration

Nginx acts as the single entry point — routing `/api/` traffic to FastAPI and everything else to Next.js.

`/etc/nginx/sites-available/default`:

```nginx
# Redirect all HTTP → HTTPS
server {
    listen 80;
    server_name buslens.live www.buslens.live;
    return 301 https://buslens.live$request_uri;
}

# HTTPS — main server block
server {
    listen 443 ssl;
    server_name buslens.live www.buslens.live;

    ssl_certificate     /etc/letsencrypt/live/buslens.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/buslens.live/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Test and apply:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL — Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d buslens.live -d www.buslens.live
```

Certbot auto-configures Nginx and sets up certificate renewal via a cron job. After running Certbot, verify the Nginx config manually — it sometimes injects conflicting server blocks that need to be cleaned up.

Certificates auto-renew. Test renewal with:
```bash
sudo certbot renew --dry-run
```

---

## DNS Configuration

Configured on GoDaddy:

| Type | Host | Value |
|------|------|-------|
| A | @ | EC2 Public IP |
| A | www | EC2 Public IP |

DNS propagation typically takes 5–15 minutes.

---

## CI/CD — GitHub Actions

### How it works

Every push to `main` triggers a GitHub Actions workflow that SSHes into EC2 and runs the deploy script.

### SSH Key Setup

Two separate SSH contexts exist in this project:

| Direction | Purpose | Key stored |
|-----------|---------|------------|
| EC2 → GitHub | `git clone` / `git pull` | EC2's `~/.ssh/` |
| GitHub → EC2 | CI/CD deploy | GitHub Actions Secret |

Generate a dedicated key for CI/CD:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
```

Add the public key to EC2:
```bash
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```

Add the private key to GitHub:
- Repo → Settings → Secrets and variables → Actions
- `EC2_HOST` — EC2 public IP
- `EC2_USER` — `ubuntu`
- `EC2_SSH_KEY` — full private key including header and footer lines

### Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/buslens-ag
            git pull origin main

            # Frontend
            cd frontend
            npm ci
            npm run build
            pm2 reload nextjs

            # Backend
            cd ../backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart fastapi
```

---

## Issues Encountered

| Issue | Symptom | Root Cause | Fix |
|-------|---------|------------|-----|
| Backend not starting | 502 Bad Gateway | Wrong Gunicorn path in systemd | Use full venv path in `ExecStart` |
| Frontend build crashing | `Killed` | Insufficient RAM on t3.micro | Added 1GB swap file |
| HTTPS timing out | `ERR_CONNECTION_TIMED_OUT` | Port 443 not open in security group | Added HTTPS inbound rule in AWS |
| Nginx returning 404 after SSL | 404 on all routes | Certbot injected conflicting server block | Manually rewrote Nginx config |
| CI/CD SSH failure | `no key found` | Public key added to secrets instead of private | Used correct private key with full header |

---

## Useful Commands

```bash
# Backend
sudo systemctl status fastapi
sudo systemctl restart fastapi
sudo journalctl -u fastapi -n 100

# Frontend
pm2 status
pm2 logs nextjs
pm2 reload nextjs

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log

# Disk / Memory
df -h
free -h
```