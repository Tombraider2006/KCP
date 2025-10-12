@echo off
echo Uploading admin navigation updates...
cd /d D:\3DC\website
scp public/admin/dashboard.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/news-editor.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/settings.html root@tomich.fun:/opt/website/public/admin/
scp public/admin/telemetry.html root@tomich.fun:/opt/website/public/admin/
echo Done! Now Files button visible everywhere!
pause



