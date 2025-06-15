# OSRS Price Tracker - Hosting Guide

This guide will help you deploy your OSRS Price Tracker application to a live server.

## Step 1: Create a DigitalOcean Account
1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Click "Sign Up"
3. You can sign up with GitHub or email
4. Add a payment method (required, but you'll get $200 free credits for 60 days)

## Step 2: Create a Droplet (Server)
1. Click "Create" → "Droplets"
2. Choose these settings:
   - Ubuntu 22.04 LTS
   - Basic Plan
   - Regular Intel CPU
   - $6/month (1GB RAM, 1 CPU)
   - Choose a datacenter region close to your users
   - Authentication: Password (for simplicity)
   - Choose a strong password and save it
3. Click "Create Droplet"

## Step 3: Connect to Your Server
1. Open your terminal
2. Run this command (replace with your server's IP):
   ```bash
   ssh root@your-server-ip
   ```
3. Enter the password you set earlier

## Step 4: Set Up the Server
1. Copy and paste these commands:
   ```bash
   # Update system
   apt update && apt upgrade -y

   # Install required software
   apt install -y git curl

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose

   # Install Nginx
   apt install -y nginx

   # Configure firewall
   ufw allow OpenSSH
   ufw allow 'Nginx Full'
   ufw allow 8000
   ufw --force enable
   ```

## Step 5: Deploy Your Application
1. Create the application directory:
   ```bash
   mkdir -p /var/www/osrs-app
   cd /var/www/osrs-app
   ```

2. Clone your repository:
   ```bash
   git clone https://github.com/your-username/osrs-app.git .
   ```

3. Create the environment file:
   ```bash
   cat > .env.prod << EOL
   # Database Configuration
   POSTGRES_USER=osrsuser
   POSTGRES_PASSWORD=osrs_secure_password_2024
   POSTGRES_DB=osrsdb
   POSTGRES_HOST=db
   POSTGRES_PORT=5432

   # Backend Configuration
   ENVIRONMENT=production
   CORS_ORIGINS=http://localhost:3000
   API_HOST=0.0.0.0
   API_PORT=8000
   WORKERS=4
   LOG_LEVEL=INFO

   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_WS_URL=ws://localhost:8000/ws
   REACT_APP_ENV=production
   EOL
   ```

4. Start the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Step 6: Set Up Domain (Optional)
1. Buy a domain from [Namecheap](https://www.namecheap.com/) or [GoDaddy](https://www.godaddy.com/)
2. In your domain provider's dashboard:
   - Go to DNS settings
   - Add an A record:
     - Host: @
     - Value: Your server's IP address
   - Add another A record:
     - Host: www
     - Value: Your server's IP address

## Step 7: Set Up SSL (Optional)
1. Install Certbot:
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. Get SSL certificate:
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

## Step 8: Monitor Your Application
1. Check if services are running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. View logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Accessing Your Application
- Without domain: http://your-server-ip:3000
- With domain: https://your-domain.com

## Troubleshooting
1. If the application doesn't start:
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f

   # Restart services
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. If you can't connect to the server:
   - Check if the server is running in DigitalOcean dashboard
   - Verify your IP is not blocked by firewall
   - Check if ports are open

3. If database issues occur:
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs db

   # Restart database
   docker-compose -f docker-compose.prod.yml restart db
   ```

## Maintenance
1. Update your application:
   ```bash
   cd /var/www/osrs-app
   git pull
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. Backup database:
   ```bash
   ./backup.sh
   ```

## Need Help?
If you encounter any issues:
1. Check the logs using the commands above
2. Make sure all ports are open
3. Verify your environment variables
4. Check if Docker services are running 