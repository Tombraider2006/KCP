@echo off
echo ====================================
echo Uploading License and Feature Fix
echo ====================================

cd /d D:\3DC\website

echo [1/2] Uploading license.html...
scp public/license.html root@tomich.fun:/opt/website/public/

echo [2/2] Uploading feature.html (sound fix)...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo.
echo Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! Uploaded:
echo - License page (license.html)
echo - Fixed feature.html (removed sound disable claim)
echo.
echo Open: https://tomich.fun/license.html
echo ====================================
pause

