@echo off
chcp 65001 > nul
echo ============================================
echo   ФИНАЛЬНАЯ ЗАГРУЗКА (гарантированно!)
echo ============================================
echo.
echo Пароль: SMU1t1_yKM
echo.

echo [1] Создание чистого архива...
cd D:\3DC
del updates_final.tar.gz 2>nul
tar -czf updates_final.tar.gz ^
  server-telemetry\server.js ^
  website\server.js ^
  website\routes\api.js ^
  website\routes\telemetry.js ^
  website\public\js\downloads.js ^
  website\public\index.html ^
  website\public\downloads.html ^
  website\public\news.html ^
  website\public\admin\dashboard.html ^
  website\public\admin\news-editor.html ^
  website\public\admin\settings.html ^
  website\public\admin\telemetry.html

echo [2] Загрузка на сервер...
scp updates_final.tar.gz root@tomich.fun:/root/

echo.
echo [3] Распаковка и установка на сервере...
echo     (Введите пароль ещё раз)
ssh root@tomich.fun "cd /root && tar -xzf updates_final.tar.gz && cp -v server-telemetry/server.js /opt/3dpc-telemetry/server.js && cp -v website/server.js /opt/website/server.js && cp -v website/routes/api.js /opt/website/routes/api.js && cp -v website/routes/telemetry.js /opt/website/routes/telemetry.js && cp -v website/public/js/downloads.js /opt/website/public/js/downloads.js && cp -v website/public/index.html /opt/website/public/index.html && cp -v website/public/downloads.html /opt/website/public/downloads.html && cp -v website/public/news.html /opt/website/public/news.html && cp -v website/public/admin/dashboard.html /opt/website/public/admin/dashboard.html && cp -v website/public/admin/news-editor.html /opt/website/public/admin/news-editor.html && cp -v website/public/admin/settings.html /opt/website/public/admin/settings.html && cp -v website/public/admin/telemetry.html /opt/website/public/admin/telemetry.html && echo '' && echo '=== Перезапуск ===' && pm2 restart 3dpc-telemetry && cd /opt/website && docker compose restart website && sleep 3 && echo '' && echo '=== PM2 Status ===' && pm2 list && echo '' && echo '=== Telemetry Logs ===' && pm2 logs 3dpc-telemetry --lines 10 --nostream"

echo.
echo ============================================
echo   ГОТОВО!
echo ============================================
pause



