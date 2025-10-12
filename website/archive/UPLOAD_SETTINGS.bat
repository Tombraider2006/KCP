@echo off
cd /d D:\3DC\website
echo Uploading settings.html...
scp public/admin/settings.html root@tomich.fun:/opt/website/public/admin/
echo Done! Reload https://tomich.fun/admin/settings.html
pause



