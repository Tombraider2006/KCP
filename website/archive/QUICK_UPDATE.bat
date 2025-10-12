@echo off
cd /d D:\3DC\website
scp public/feature.html root@tomich.fun:/opt/website/public/
ssh root@tomich.fun "cd /opt/website && docker compose restart"
echo DONE! Check https://tomich.fun/features/telegram
pause



