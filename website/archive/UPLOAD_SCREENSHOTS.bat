@echo off
echo ====================================
echo Uploading Screenshots and Pages
echo ====================================

cd /d D:\3DC\website

echo [1/3] Uploading all screenshots...
scp -r public/screenshots root@tomich.fun:/opt/website/public/

echo [2/3] Uploading updated index.html...
scp public/index.html root@tomich.fun:/opt/website/public/

echo [3/3] Uploading updated feature.html...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo ====================================
echo DONE! Uploaded:
echo - 14 renamed screenshots
echo - Updated main page with real screenshots
echo - Added screenshots to feature pages:
echo   * Monitoring - main interface
echo   * Analytics - efficiency chart
echo   * Telegram - settings dialog
echo   * Power - smart plugs choice
echo   * Webserver - web interface
echo ====================================
echo Check: https://tomich.fun
pause



