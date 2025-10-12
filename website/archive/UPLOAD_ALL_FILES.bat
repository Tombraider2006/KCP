@echo off
echo ====================================
echo Complete Files Module Upload
echo ====================================

cd /d D:\3DC\website

echo [1/5] Uploading package.json...
scp package.json root@tomich.fun:/opt/website/

echo [2/5] Uploading server.js...
scp server.js root@tomich.fun:/opt/website/

echo [3/5] Uploading files.html...
scp public/admin/files.html root@tomich.fun:/opt/website/public/admin/

echo [4/5] Uploading upload routes...
scp routes/upload.js root@tomich.fun:/opt/website/routes/

echo [5/5] Uploading updated CSS and index...
scp public/css/style.css root@tomich.fun:/opt/website/public/css/
scp public/index.html root@tomich.fun:/opt/website/public/

echo Installing dependencies and restarting...
ssh root@tomich.fun "cd /opt/website && npm install && docker compose restart"

echo ====================================
echo DONE! Website updated with:
echo - Files upload module
echo - Reduced spacing
echo - Clickable feature cards
echo ====================================
echo Open: https://tomich.fun/admin/files.html
pause



