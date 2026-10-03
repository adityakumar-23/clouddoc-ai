# CloudDoc AI — AWS Production Deployment Guide

This guide provides end-to-end instructions for deploying **CloudDoc AI** to a production-grade AWS infrastructure using Ubuntu 24.04 LTS on EC2, Amazon RDS PostgreSQL, Amazon S3, Route 53, Application Load Balancer (ALB), and Amazon CloudWatch.

---

## Architecture Topology

```mermaid
flowchart TD
    Client["HTTPS Clients (Web / Mobile)"] --> R53["Route 53 DNS (clouddoc.ai)"]
    R53 --> ALB["Application Load Balancer (SSL Termination ACM)"]
    ALB --> TG["Target Group: HTTP 80 / 5000"]
    
    subgraph VPC ["AWS Virtual Private Cloud (10.0.0.0/16)"]
        subgraph PublicSubnet ["Public Subnets (AZ-a / AZ-b)"]
            NAT["NAT Gateway"]
            Bastion["Bastion / ALB Listener"]
        end

        subgraph AppSubnet ["App Subnets (Private)"]
            EC2["EC2 Ubuntu 24.04 (t3.xlarge)<br/>- Nginx Reverse Proxy<br/>- PM2 Cluster (Node.js API)<br/>- PM2 BullMQ Workers<br/>- Tesseract OCR Engine"]
        end

        subgraph DataSubnet ["Isolated Data Subnets (Private)"]
            RDS[("Amazon RDS PostgreSQL 16<br/>Multi-AZ db.m6g.large")]
            ElastiCache[("Amazon ElastiCache Redis 7.0<br/>Replication Group")]
        end
    end

    EC2 --> RDS
    EC2 --> ElastiCache
    EC2 -->|"Signed Uploads / Downloads"| S3[("Amazon S3<br/>clouddoc-production-documents<br/>SSE-S3 + Versioning + Glacier Lifecycle")]
    EC2 -->|"Structured Audit Logs & Metrics"| CW["Amazon CloudWatch Logs & Metrics"]
```

---

## Step-by-Step Deployment (20 Steps)

### Step 1: AWS Account & Region Selection
1. Log in to AWS Management Console.
2. Select your primary production region (e.g., `us-east-1` or `eu-west-1`).

### Step 2: Create IAM Role for EC2 Instance (`CloudDoc-EC2-Role`)
Never hardcode permanent AWS Access Keys inside EC2. Instead, attach an IAM instance profile:
1. Navigate to **IAM > Roles > Create Role**.
2. Select **Trusted entity: AWS service > EC2**.
3. Attach policies:
   - `AmazonS3FullAccess` (or scoped policy for `arn:aws:s3:::clouddoc-production-storage/*`)
   - `CloudWatchAgentServerPolicy`
   - `AmazonSSMManagedInstanceCore` (for passwordless SSH via AWS SSM Session Manager)
4. Name role `CloudDocEC2InstanceRole` and save.

### Step 3: Create Custom VPC
1. Navigate to **VPC > Create VPC** (VPC and more).
2. Name: `clouddoc-vpc`.
3. CIDR: `10.0.0.0/16`.
4. Number of AZs: 2.
5. 2 Public Subnets (`10.0.1.0/24`, `10.0.2.0/24`).
6. 2 Private App Subnets (`10.0.10.0/24`, `10.0.20.0/24`).
7. 2 Isolated Database Subnets (`10.0.100.0/24`, `10.0.200.0/24`).
8. NAT Gateways: 1 per AZ (for high-availability outbound worker downloads).

### Step 4: Configure Security Groups
Create 4 distinct security groups:
1. `clouddoc-alb-sg`:
   - Inbound: Port 80 (HTTP) from `0.0.0.0/0`, Port 443 (HTTPS) from `0.0.0.0/0`.
2. `clouddoc-ec2-sg`:
   - Inbound: Port 80 and 5000 only from `clouddoc-alb-sg`.
   - Inbound: Port 22 from your office/VPN CIDR only.
3. `clouddoc-rds-sg`:
   - Inbound: Port 5432 only from `clouddoc-ec2-sg`.
4. `clouddoc-redis-sg`:
   - Inbound: Port 6379 only from `clouddoc-ec2-sg`.

### Step 5: Provision Amazon RDS PostgreSQL
1. Navigate to **RDS > Databases > Create Database**.
2. Choose **PostgreSQL 16.2**.
3. Template: **Production**.
4. Multi-AZ: Enabled (Standby replica in alternate AZ).
5. DB instance class: `db.m6g.large` (Graviton3, 2 vCPU, 8 GiB RAM).
6. Storage: 100 GiB gp3, autoscale up to 1000 GiB.
7. Subnet Group: Isolated Database Subnets.
8. Public Access: **No**.
9. VPC Security Group: `clouddoc-rds-sg`.
10. Database name: `clouddoc_db`.
11. Enable IAM database authentication and automated backups (7-day retention).

### Step 6: Create Amazon S3 Bucket
1. Navigate to **S3 > Create Bucket**.
2. Name: `clouddoc-production-documents-unique-suffix`.
3. Block *all* public access: **Checked** (True).
4. Default encryption: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
5. Bucket Versioning: **Enabled**.
6. Lifecycle Rule:
   - Transition non-current versions to S3 Standard-IA after 30 days.
   - Transition temporary/ prefix items to expiration after 24 hours.
   - Transition processed files to Glacier Flexible Retrieval after 90 days.
7. CORS configuration:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": ["https://clouddoc.ai"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Step 7: Launch Ubuntu EC2 Instance
1. Navigate to **EC2 > Launch Instance**.
2. AMI: **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type**.
3. Architecture: 64-bit (x86_64).
4. Instance Type: `t3.xlarge` (4 vCPU, 16 GiB RAM) for handling concurrent PDF parsing and OCR workloads.
5. Subnet: Private App Subnet (connected to NAT Gateway) or Public Subnet with EIP.
6. IAM Instance Profile: Select `CloudDocEC2InstanceRole`.
7. Storage: 80 GiB gp3 root volume.
8. Security Group: `clouddoc-ec2-sg`.

### Step 8: Configure EC2 Host Operating System
Connect via SSH or AWS SSM Session Manager:
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential tesseract-ocr tesseract-ocr-eng libpq-dev
```

### Step 9: Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v # Verify v20.x
npm -v  # Verify v10.x
```

### Step 10: Install & Configure Nginx
```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

Create `/etc/nginx/sites-available/clouddoc`:
```nginx
upstream backend_nodes {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    server_name clouddoc.ai www.clouddoc.ai;

    # Maximum upload payload size for multi-page documents
    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static Frontend SPA
    root /var/www/clouddoc/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Reverse Proxy with Streaming Support
    location /api/ {
        proxy_pass http://backend_nodes;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        proxy_buffering off;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/clouddoc /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 11: Install & Configure PM2 Process Manager
```bash
sudo npm install -g pm2
sudo mkdir -p /var/log/clouddoc
sudo chown -R ubuntu:ubuntu /var/log/clouddoc
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 12: Configure Environment Variables
Clone the codebase to `/opt/clouddoc`:
```bash
sudo mkdir -p /opt/clouddoc
sudo chown -R ubuntu:ubuntu /opt/clouddoc
git clone <YOUR_REPO_URL> /opt/clouddoc
cd /opt/clouddoc
```
Create `/opt/clouddoc/backend/.env`:
```env
PORT=5000
NODE_ENV=production
APP_URL=https://clouddoc.ai
CORS_ORIGIN=https://clouddoc.ai

DATABASE_URL=postgresql://clouddoc_user:YOUR_STRONG_PASSWORD@clouddoc-rds-endpoint.us-east-1.rds.amazonaws.com:5432/clouddoc_db?schema=public&connection_limit=20

REDIS_URL=redis://clouddoc-redis-endpoint.us-east-1.cache.amazonaws.com:6379

STORAGE_DRIVER=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=clouddoc-production-documents-unique-suffix
USE_IAM_ROLE=true

JWT_SECRET=GENERATE_A_64_CHAR_HEX_KEY
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=GENERATE_ANOTHER_64_CHAR_HEX_KEY
JWT_REFRESH_EXPIRES_IN=7d

AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_PRODUCTION_KEY

ENABLE_CLOUDWATCH=true
CLOUDWATCH_LOG_GROUP=/clouddoc/production/api
```

### Step 13: Run Database Migrations & Seeds
```bash
cd /opt/clouddoc/backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run seed # Seeds default roles, admin account, and demo data
```

### Step 14: Deploy Backend Application
```bash
cd /opt/clouddoc/backend
npm run build
cd /opt/clouddoc
pm2 start ecosystem.config.js --env production
pm2 save
```

### Step 15: Deploy Frontend SPA
```bash
cd /opt/clouddoc/frontend
npm ci
npm run build
sudo mkdir -p /var/www/clouddoc/html
sudo cp -r dist/* /var/www/clouddoc/html/
```

### Step 16: Route 53 DNS Configuration
1. Navigate to **Route 53 > Hosted Zones > clouddoc.ai**.
2. Create `A` Record:
   - Name: `@` (apex)
   - Alias: **Yes** -> Route traffic to Application Load Balancer.
3. Create `CNAME` Record:
   - Name: `www` -> `clouddoc.ai`.

### Step 17: SSL Certificate (AWS Certificate Manager or Let's Encrypt Certbot)
**Option A: Using ALB + AWS ACM (Recommended Enterprise Path)**:
- Request ACM certificate for `clouddoc.ai` and `*.clouddoc.ai`.
- Add DNS validation CNAME in Route 53.
- In ALB listener (Port 443), attach the certificate and forward traffic to EC2 Target Group.

**Option B: Direct EC2 with Certbot**:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d clouddoc.ai -d www.clouddoc.ai --non-interactive --agree-tos -m devops@clouddoc.ai
```

### Step 18: Amazon CloudWatch Agent Installation
Install CloudWatch unified agent on EC2:
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```
Configure `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`:
```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/clouddoc/api-out.log",
            "log_group_name": "/clouddoc/production/api",
            "log_stream_name": "{instance_id}-api"
          },
          {
            "file_path": "/var/log/clouddoc/worker-out.log",
            "log_group_name": "/clouddoc/production/workers",
            "log_stream_name": "{instance_id}-worker"
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"] },
      "disk": { "measurement": ["used_percent"], "resources": ["/"] }
    }
  }
}
```
Start the agent:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### Step 19: Health & Smoke Testing
Verify the live health check:
```bash
curl -I https://clouddoc.ai/api/v1/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-10-03T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": { "status": "up", "latencyMs": 4 },
    "storage": { "status": "up", "driver": "s3" },
    "queue": { "status": "up", "waiting": 0 }
  }
}
```

### Step 20: CI/CD Secret Configuration
Navigate to your GitHub repository **Settings > Secrets and variables > Actions** and add:
- `EC2_HOST`: The Elastic IP or public DNS of your EC2 instance.
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: The contents of your private SSH deploy key (`~/.ssh/id_rsa`).

Every push to `main` will automatically build, test, run DB migrations, build frontend, and perform a zero-downtime PM2 reload!
