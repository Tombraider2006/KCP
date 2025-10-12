@echo off
echo Загрузка файлов на tomich.fun...
echo Пароль: SMU1t1_yKM
echo.

scp D:\3DC\server-telemetry\server.js root@tomich.fun:/opt/3dpc-telemetry/server.js
scp D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/api.js
scp D:\3DC\website\routes\telemetry.js root@tomich.fun:/opt/website/routes/telemetry.js
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/server.js
scp D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/downloads.js
scp D:\3DC\website\public\admin\telemetry.html root@tomich.fun:/opt/website/public/admin/telemetry.html

echo.
echo Перезапуск...
ssh root@tomich.fun "pm2 restart 3dpc-telemetry && cd /opt/website && docker compose restart website"

echo.
echo Готово!
pause



