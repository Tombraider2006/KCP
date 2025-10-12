@echo off
echo ====================================
echo Re-uploading CORRECTED Screenshots
echo ====================================

cd /d D:\3DC\website

echo [1/2] Uploading corrected screenshots folder...
scp -r public/screenshots root@tomich.fun:/opt/website/public/

echo [2/2] Restarting to apply changes (optional)...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! Corrected screenshots uploaded
echo - Fixed: main-interface-light now shows light theme
echo - Fixed: analytics-efficiency now shows real chart
echo ====================================
pause



