@echo off
echo ====================================
echo Uploading License + Footer Updates
echo ====================================

cd /d D:\3DC\website

echo [1/7] Uploading license.html...
scp public/license.html root@tomich.fun:/opt/website/public/

echo [2/7] Uploading index.html (footer with license link)...
scp public/index.html root@tomich.fun:/opt/website/public/

echo [3/7] Uploading downloads.html...
scp public/downloads.html root@tomich.fun:/opt/website/public/

echo [4/7] Uploading news.html...
scp public/news.html root@tomich.fun:/opt/website/public/

echo [5/7] Uploading news-single.html...
scp public/news-single.html root@tomich.fun:/opt/website/public/

echo [6/7] Uploading feature.html (sound fix + footer)...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo.
echo [7/7] Restarting Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"

echo ====================================
echo DONE! All pages updated:
echo + License page added (license.html)
echo + Footer updated on all pages:
echo   - Added license link
echo   - REMOVED Telegram link (too many messages!)
echo + Year changed 2024 -^> 2025
echo + Fixed sound description (removed disable claim)
echo.
echo Open: https://tomich.fun/license.html
echo ====================================
pause

