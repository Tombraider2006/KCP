@echo off
cd /d D:\3DC\website
echo Uploading upload API...
scp routes/upload.js root@tomich.fun:/opt/website/routes/
ssh root@tomich.fun "cd /opt/website && docker compose restart"
echo Done! API ready.
pause



