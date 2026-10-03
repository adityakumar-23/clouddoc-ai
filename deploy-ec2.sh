#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 CLOUDDOC AI - AUTOMATED EC2 DEPLOYMENT STARTING"
echo "=========================================================="

# 1. SETUP SWAP MEMORY (Crucial for 1GB RAM instances to prevent OOM)
if [ ! -f /swapfile ]; then
    echo "⚙️ Creating 2GB Swap Memory..."
    sudo fallocate -l 2G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap memory enabled successfully."
fi

# 2. SYSTEM PACKAGES
echo "📦 Updating packages and installing prerequisites..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y curl git nginx postgresql postgresql-contrib redis-server poppler-utils tesseract-ocr build-essential

# 3. NODE.JS 20 LTS & PM2
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
sudo npm install -g pm2

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 4. POSTGRESQL & REDIS SERVICES
echo "🗄️ Configuring Database and Redis..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Create database user and DB if they don't exist
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'clouddoc') THEN CREATE USER clouddoc WITH PASSWORD 'clouddoc123' CREATEDB; END IF; END \$\$;" || true
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'clouddoc_db'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE clouddoc_db OWNER clouddoc;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE clouddoc_db TO clouddoc;" || true

# 5. CLONE APPLICATION REPO
echo "📥 Cloning CloudDoc AI repository..."
cd /home/ubuntu
if [ -d "clouddoc-ai" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd clouddoc-ai
    git pull origin main
else
    git clone https://github.com/adityakumar-23/clouddoc-ai.git
    cd clouddoc-ai
fi

# Get Public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "34.229.154.235")
echo "🌐 Detected Public IP: $PUBLIC_IP"

# 6. SETUP BACKEND
echo "⚙️ Setting up Backend API..."
cd /home/ubuntu/clouddoc-ai/backend

cat << ENVEOF > .env
PORT=5000
NODE_ENV=production
APP_NAME="CloudDoc AI"
API_URL="http://${PUBLIC_IP}/api/v1"
FRONTEND_URL="http://${PUBLIC_IP}"
DATABASE_URL="postgresql://clouddoc:clouddoc123@localhost:5432/clouddoc_db?schema=public"
JWT_SECRET="clouddoc_super_secure_production_secret_key_2026_xyz"
JWT_REFRESH_SECRET="clouddoc_super_secure_refresh_secret_key_2026_abc"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
STORAGE_DRIVER="local"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="clouddoc-docs-aditya-2026"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
CORS_ORIGIN="*"
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=60000
ENVEOF

npm install
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

pm2 delete clouddoc-backend 2>/dev/null || true
pm2 start dist/server.js --name "clouddoc-backend"
pm2 save

# 7. SETUP FRONTEND
echo "🎨 Building Frontend..."
cd /home/ubuntu/clouddoc-ai/frontend
npm install
npm run build

sudo mkdir -p /var/www/clouddoc/html
sudo rm -rf /var/www/clouddoc/html/*
sudo cp -r dist/* /var/www/clouddoc/html/
sudo chown -R www-data:www-data /var/www/clouddoc

# 8. CONFIGURE NGINX REVERSE PROXY
echo "🌐 Configuring Nginx Web Server..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/clouddoc/html;
    index index.html;

    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }
}
NGINX_EOF

sudo nginx -t
sudo systemctl restart nginx

echo "=========================================================="
echo "🎉 DEPLOYMENT COMPLETE & CLOUDDOC AI IS LIVE!"
echo "🌐 Open in your browser: http://${PUBLIC_IP}"
echo "=========================================================="
