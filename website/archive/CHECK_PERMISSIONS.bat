@echo off
echo ====================================
echo Checking Permissions
echo ====================================

echo [1] Checking public folder permissions...
ssh root@tomich.fun "docker exec 3dpc-website ls -la /app/public/ | head -10"

echo.
echo [2] Checking who runs Node.js...
ssh root@tomich.fun "docker exec 3dpc-website whoami"
ssh root@tomich.fun "docker exec 3dpc-website id"

echo.
echo [3] Checking uploads folder...
ssh root@tomich.fun "docker exec 3dpc-website ls -la /app/uploads/ 2>&1"

echo.
echo [4] Testing write permissions...
ssh root@tomich.fun "docker exec 3dpc-website touch /app/public/test.txt && echo 'Write OK' || echo 'Write FAILED'"
ssh root@tomich.fun "docker exec 3dpc-website rm /app/public/test.txt 2>/dev/null"

echo.
echo ====================================
echo If write FAILED, need to fix permissions:
echo ssh root@tomich.fun "chown -R 1000:1000 /opt/website/public /opt/website/uploads"
echo ====================================
pause



