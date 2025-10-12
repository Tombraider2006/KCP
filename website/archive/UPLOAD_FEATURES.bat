@echo off
echo ====================================
echo Uploading Features Module
echo ====================================

cd /d D:\3DC\website

echo [1/3] Uploading feature.html...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo [2/3] Uploading features routes...
scp routes/features.js root@tomich.fun:/opt/website/routes/

echo [3/3] Uploading updated server.js...
scp server.js root@tomich.fun:/opt/website/

echo [4/4] Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! Check https://tomich.fun/features/sorting
echo ====================================
pause



