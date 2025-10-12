@echo off
echo ====================================
echo Uploading Files.html Fix
echo ====================================

cd /d D:\3DC\website

echo Uploading fixed files.html (removed onclick)...
scp public/admin/files.html root@tomich.fun:/opt/website/public/admin/files.html

echo Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! Fixed:
echo - Removed onclick/onchange handlers
echo - Added proper addEventListener
echo - File upload buttons now work!
echo ====================================
echo Test: https://tomich.fun/admin/files.html
pause



