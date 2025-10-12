@echo off
echo ====================================
echo Uploading CSP Fix
echo ====================================

cd /d D:\3DC\website

echo [1/2] Uploading server.js with admin CSP fix...
scp server.js root@tomich.fun:/opt/website/

echo [2/2] Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! CSP fixed, now admin file upload will work
echo ====================================
pause



