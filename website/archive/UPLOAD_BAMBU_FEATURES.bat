@echo off
echo ====================================
echo Uploading Bambu Lab Features Update
echo ====================================

cd /d D:\3DC\website

echo [1/1] Uploading feature.html with updated Bambu descriptions...
scp public/feature.html root@tomich.fun:/opt/website/public/

echo ====================================
echo DONE! Website updated with:
echo - Accurate Bambu Lab feature descriptions
echo - Removed fictional features
echo - Added info about detailed printer page
echo ====================================
echo Check: https://tomich.fun/features/bambu
pause



