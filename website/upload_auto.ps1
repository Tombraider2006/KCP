# Автоматическая загрузка файлов на сервер
$password = "SMU1t1_yKM"

Write-Host "=== Загрузка файлов на tomich.fun ===" -ForegroundColor Cyan
Write-Host ""

# Function to run scp with password
function Upload-File {
    param($source, $destination)
    
    Write-Host "Загружаю: $source" -ForegroundColor Yellow
    
    # Use plink/pscp if available, otherwise use expect-like approach
    $plink = Get-Command plink.exe -ErrorAction SilentlyContinue
    
    if ($plink) {
        # Using PuTTY tools
        echo y | plink.exe -pw $password root@tomich.fun "exit" 2>$null | Out-Null
        pscp.exe -pw $password $source root@tomich.fun:$destination
    } else {
        # Using OpenSSH (requires manual password entry)
        Write-Host "Пароль: $password" -ForegroundColor Green
        C:\Windows\System32\OpenSSH\scp.exe $source root@tomich.fun:$destination
    }
}

# Upload files
Upload-File "D:\3DC\website\routes\api.js" "/opt/website/routes/api.js"
Upload-File "D:\3DC\website\public\js\downloads.js" "/opt/website/public/js/downloads.js"

Write-Host ""
Write-Host "=== Перезапуск контейнера ===" -ForegroundColor Cyan
Write-Host "Пароль: $password" -ForegroundColor Green

ssh root@tomich.fun "cd /opt/website && docker compose restart website && sleep 5 && docker compose logs --tail 30 website"

Write-Host ""
Write-Host "=== Готово! ===" -ForegroundColor Green
Write-Host "Откройте https://tomich.fun/downloads и проверьте что релизы загружаются" -ForegroundColor White



