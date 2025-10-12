@echo off
echo Загрузка...
echo Пароль: SMU1t1_yKM
echo.

scp D:\3DC\server-telemetry\server.js root@tomich.fun:/opt/3dpc-telemetry/server_NEW.js
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/server_NEW.js
scp D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/api_NEW.js
scp D:\3DC\website\routes\telemetry.js root@tomich.fun:/opt/website/routes/telemetry_NEW.js
scp D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/downloads_NEW.js
scp D:\3DC\website\public\admin\dashboard.html root@tomich.fun:/opt/website/public/admin/dashboard_NEW.html
scp D:\3DC\website\public\admin\telemetry.html root@tomich.fun:/opt/website/public/admin/telemetry_NEW.html

echo.
echo Применение изменений...
ssh root@tomich.fun "mv /opt/3dpc-telemetry/server_NEW.js /opt/3dpc-telemetry/server.js && mv /opt/website/server_NEW.js /opt/website/server.js && mv /opt/website/routes/api_NEW.js /opt/website/routes/api.js && mv /opt/website/routes/telemetry_NEW.js /opt/website/routes/telemetry.js && mv /opt/website/public/js/downloads_NEW.js /opt/website/public/js/downloads.js && mv /opt/website/public/admin/dashboard_NEW.html /opt/website/public/admin/dashboard.html && mv /opt/website/public/admin/telemetry_NEW.html /opt/website/public/admin/telemetry.html && pm2 restart 3dpc-telemetry && cd /opt/website && docker compose restart website && sleep 3 && pm2 logs 3dpc-telemetry --lines 5 --nostream"

pause



