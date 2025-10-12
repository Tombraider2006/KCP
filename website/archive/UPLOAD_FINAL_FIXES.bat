@echo off
echo ====================================
echo Uploading Final Fixes
echo ====================================

cd /d D:\3DC\website

echo [1/2] Uploading files.html (CSP fix - removed onclick)...
scp public/admin/files.html root@tomich.fun:/opt/website/public/admin/files.html

echo [2/2] Uploading feature.html (Bambu Lab description fix)...
scp public/feature.html root@tomich.fun:/opt/website/public/feature.html

echo [3/3] Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! Fixed:
echo 1. File upload buttons work (no CSP errors)
echo 2. Bambu Lab honest description (10-90 sec)
echo ====================================
echo Test files upload: https://tomich.fun/admin/files.html
echo Test Bambu page: https://tomich.fun/features/bambu
pause



