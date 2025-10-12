@echo off
echo ====================================
echo Uploading All Updates
echo ====================================

cd /d D:\3DC\website

echo [1/7] Uploading server.js with fixed CSP...
scp server.js root@tomich.fun:/opt/website/

echo [2/7] Uploading upload.js with restart command...
scp routes/upload.js root@tomich.fun:/opt/website/routes/

echo [3/7] Uploading docker-compose.yml with Docker socket...
scp docker-compose-updated.yml root@tomich.fun:/opt/website/docker-compose.yml

echo [4/7] Uploading feature.html with updated descriptions...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo [5/7] Uploading admin pages with Files nav...
scp public/admin/dashboard.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/news-editor.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/settings.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/telemetry.html root@tomich.fun:/opt/website/public/admin/

echo [6/7] Stopping and recreating Docker with new config...
ssh root@tomich.fun "cd /opt/website && docker compose down && docker compose up -d"

echo [7/7] Waiting for startup (10 sec)...
timeout /t 10 /nobreak

echo ====================================
echo DONE! Updates:
echo - CSP fixed for admin panel
echo - Docker socket mounted for restart button
echo - Files button in all admin pages
echo - Features descriptions updated from docs
echo - Restart server button works!
echo ====================================
echo Test: https://tomich.fun/admin/files.html
pause

