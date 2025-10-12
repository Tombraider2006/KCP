@echo off
echo ====================================
echo Uploading CORRECTED Screenshots
echo ====================================

cd /d D:\3DC\website

echo [1/2] Uploading fixed screenshots folder...
scp -r public/screenshots root@tomich.fun:/opt/website/public/

echo [2/2] Uploading updated feature.html...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo ====================================
echo DONE! Corrected screenshots:
echo Main page:
echo - main-interface-dark.png (темная тема)
echo - analytics-efficiency.png (график)
echo - web-interface-light.png (web-интерфейс)
echo.
echo Feature pages:
echo - /features/monitoring: main-interface-dark.png
echo - /features/analytics: analytics-efficiency.png
echo - /features/telegram: telegram-settings.png
echo - /features/power: smart-plugs-choice.png
echo - /features/webserver: webserver-info.png
echo ====================================
pause



