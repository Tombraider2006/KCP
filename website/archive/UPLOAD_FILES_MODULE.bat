@echo off
echo ====================================
echo Uploading Files Module
echo ====================================

cd /d D:\3DC\website

echo [1/3] Uploading package.json with multer...
scp package.json root@tomich.fun:/opt/website/

echo [2/3] Uploading files.html...
scp public/admin/files.html root@tomich.fun:/opt/website/public/admin/

echo [3/3] Uploading upload routes...
scp routes/upload.js root@tomich.fun:/opt/website/routes/

echo [4/4] Installing multer and restarting...
ssh root@tomich.fun "cd /opt/website && npm install && docker compose restart"

echo ====================================
echo Done! Open https://tomich.fun/admin/files.html
echo ====================================
pause



