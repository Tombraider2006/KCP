#!/bin/bash
# Upload files to server

PASSWORD="SMU1t1_yKM"
SERVER="root@tomich.fun"

echo "Uploading api.js..."
scp /mnt/d/3DC/website/routes/api.js $SERVER:/opt/website/routes/

echo "Uploading downloads.js..."
scp /mnt/d/3DC/website/public/js/downloads.js $SERVER:/opt/website/public/js/

echo "Restarting Docker container..."
ssh $SERVER "cd /opt/website && docker compose restart website && sleep 5 && docker compose logs --tail 30 website"

echo "Done!"



