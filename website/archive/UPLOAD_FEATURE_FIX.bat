@echo off
echo ====================================
echo Uploading Feature.html Fix
echo ====================================

cd /d D:\3DC\website

echo Uploading corrected feature.html (MQTT interval fix)...
scp public/feature.html root@tomich.fun:/opt/website/public/feature.html

echo ====================================
echo DONE! Fixed MQTT description:
echo - Removed "delay less than 1 second" lie
echo - Added honest "10-90 seconds interval"
echo ====================================
echo Check: https://tomich.fun/features/bambu
pause



