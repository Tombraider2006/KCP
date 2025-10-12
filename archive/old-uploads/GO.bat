@echo off
scp D:\3DC\server-telemetry\server.js root@tomich.fun:/opt/3dpc-telemetry/server.js
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/server.js
scp D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/api.js
scp D:\3DC\website\routes\telemetry.js root@tomich.fun:/opt/website/routes/telemetry.js
scp D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/downloads.js
scp D:\3DC\website\public\admin\dashboard.html root@tomich.fun:/opt/website/public/admin/dashboard.html
scp D:\3DC\website\public\admin\telemetry.html root@tomich.fun:/opt/website/public/admin/telemetry.html
ssh root@tomich.fun "pm2 restart 3dpc-telemetry && cd /opt/website && docker compose restart website && sleep 3 && pm2 logs 3dpc-telemetry --lines 10 --nostream"
pause



