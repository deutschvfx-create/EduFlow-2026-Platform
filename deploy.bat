@echo off
echo Connecting to Hetzner VPS (46.224.154.154)...
echo Please enter the password when prompted: 123456789
ssh root@46.224.154.154 "cd /root/EduFlow-2026-Platform && git pull origin main && npm run build && pm2 restart all"
echo.
echo Deployment finished! Please check https://unipri.me/register
pause
