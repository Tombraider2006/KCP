@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════════════╗
echo ║     ФИНАЛЬНАЯ ЗАГРУЗКА - Все файлы проверены    ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo Пароль: SMU1t1_yKM (вводите каждый раз когда попросит)
echo.

scp D:\3DC\server-telemetry\server.js D:\3DC\website\server.js D:\3DC\website\routes\api.js D:\3DC\website\routes\telemetry.js D:\3DC\website\public\js\downloads.js D:\3DC\website\public\index.html D:\3DC\website\public\downloads.html D:\3DC\website\public\news.html D:\3DC\website\public\admin\dashboard.html D:\3DC\website\public\admin\news-editor.html D:\3DC\website\public\admin\settings.html D:\3DC\website\public\admin\telemetry.html root@tomich.fun:/root/upload/

echo.
echo Перемещаем и перезапускаем...
ssh root@tomich.fun "mkdir -p /root/upload && cp /root/upload/server.js /opt/3dpc-telemetry/ && cp /root/upload/server.js /opt/website/ 2>/dev/null; cp /root/upload/api.js /opt/website/routes/ && cp /root/upload/telemetry.js /opt/website/routes/ && cp /root/upload/downloads.js /opt/website/public/js/ && cp /root/upload/*.html /opt/website/public/ 2>/dev/null; cp /root/upload/index.html /opt/website/public/ && cp /root/upload/downloads.html /opt/website/public/ && cp /root/upload/news.html /opt/website/public/ && cp /root/upload/dashboard.html /opt/website/public/admin/ && cp /root/upload/news-editor.html /opt/website/public/admin/ && cp /root/upload/settings.html /opt/website/public/admin/ && cp /root/upload/telemetry.html /opt/website/public/admin/ && pm2 restart 3dpc-telemetry && cd /opt/website && docker compose restart website && sleep 3 && echo '' && echo '=== PM2 ===' && pm2 list && echo '' && echo '=== Telemetry Logs ===' && pm2 logs 3dpc-telemetry --lines 10 --nostream"

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║                ✅ ГОТОВО!                        ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo Откройте: https://tomich.fun/admin/telemetry.html
echo.
pause



