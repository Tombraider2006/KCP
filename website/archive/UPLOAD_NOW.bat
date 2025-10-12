@echo off
echo ====================================
echo Uploading favicon and news page
echo ====================================

cd /d D:\3DC\website

echo.
echo [1/2] Uploading favicon...
scp public/favicon.ico root@tomich.fun:/opt/website/public/

echo.
echo [2/2] Uploading news-single.html...
scp public/news-single.html root@tomich.fun:/opt/website/public/

echo.
echo [3/3] Restarting website...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo.
echo ====================================
echo Done! Check https://tomich.fun/news
echo ====================================
pause



