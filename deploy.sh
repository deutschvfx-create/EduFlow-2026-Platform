#!/bin/bash

# EduFlow Deployment Script for Hetzner VPS
# This script automates the deployment process with zero-downtime reload

set -e  # Exit on error

echo "🚀 Starting EduFlow deployment..."

# 1. Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# 3. Build production bundle
echo "🔨 Building production bundle..."
npm run build

# 4. Create logs directory if it doesn't exist
mkdir -p logs

# 5. Reload PM2 process (zero-downtime)
echo "♻️  Reloading PM2 process..."
pm2 reload ecosystem.config.js --update-env

# 6. Show status
echo "✅ Deployment complete!"
pm2 status
pm2 logs eduflow --lines 20 --nostream

echo ""
echo "🎉 EduFlow is now running!"
echo "📊 Monitor logs: pm2 logs eduflow"
echo "📈 Monitor status: pm2 monit"
