@echo off
chcp 65001 > nul
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🚀 Загрузка всех обновлений на tomich.fun                  ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Пароль для всех команд: SMU1t1_yKM
echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  ЧАСТЬ 1: Телеметрия (порт 3000)                            │
echo └──────────────────────────────────────────────────────────────┘
echo.

echo [1/12] Загрузка server-telemetry/server.js...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\server-telemetry\server.js root@tomich.fun:/opt/3dpc-telemetry/
if errorlevel 1 goto error

echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  ЧАСТЬ 2: Website Backend (порт 8080)                       │
echo └──────────────────────────────────────────────────────────────┘
echo.

echo [2/12] Загрузка website/server.js...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\server.js root@tomich.fun:/opt/website/
if errorlevel 1 goto error

echo [3/12] Загрузка website/routes/api.js...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/
if errorlevel 1 goto error

echo [4/12] Загрузка website/routes/telemetry.js (новый файл)...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\routes\telemetry.js root@tomich.fun:/opt/website/routes/
if errorlevel 1 goto error

echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  ЧАСТЬ 3: Frontend (Admin & Public)                         │
echo └──────────────────────────────────────────────────────────────┘
echo.

echo [5/12] Загрузка website/public/js/downloads.js...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/
if errorlevel 1 goto error

echo [6/12] Загрузка website/public/admin/dashboard.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\admin\dashboard.html root@tomich.fun:/opt/website/public/admin/
if errorlevel 1 goto error

echo [7/12] Загрузка website/public/admin/news-editor.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\admin\news-editor.html root@tomich.fun:/opt/website/public/admin/
if errorlevel 1 goto error

echo [8/12] Загрузка website/public/admin/settings.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\admin\settings.html root@tomich.fun:/opt/website/public/admin/
if errorlevel 1 goto error

echo [9/12] Загрузка website/public/admin/telemetry.html (новая страница)...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\admin\telemetry.html root@tomich.fun:/opt/website/public/admin/
if errorlevel 1 goto error

echo [10/12] Загрузка website/public/index.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\index.html root@tomich.fun:/opt/website/public/
if errorlevel 1 goto error

echo [11/12] Загрузка website/public/downloads.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\downloads.html root@tomich.fun:/opt/website/public/
if errorlevel 1 goto error

echo [12/12] Загрузка website/public/news.html...
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\news.html root@tomich.fun:/opt/website/public/
if errorlevel 1 goto error

echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  ЧАСТЬ 4: Перезапуск серверов                               │
echo └──────────────────────────────────────────────────────────────┘
echo.

echo [Перезапуск] PM2 - Телеметрия...
ssh root@tomich.fun "pm2 restart 3dpc-telemetry"
if errorlevel 1 goto error

echo [Перезапуск] Docker - Website...
ssh root@tomich.fun "cd /opt/website && docker compose restart website"
if errorlevel 1 goto error

echo.
echo Ожидание 5 секунд...
timeout /t 5 /nobreak > nul

echo.
echo ┌──────────────────────────────────────────────────────────────┐
echo │  ЧАСТЬ 5: Проверка логов                                    │
echo └──────────────────────────────────────────────────────────────┘
echo.

echo [Логи] Телеметрия (последние 10 строк):
ssh root@tomich.fun "pm2 logs 3dpc-telemetry --lines 10 --nostream"

echo.
echo [Логи] Website (последние 10 строк):
ssh root@tomich.fun "cd /opt/website && docker compose logs --tail 10 website"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ✅ ВСЕ ОБНОВЛЕНИЯ ЗАГРУЖЕНЫ И ПРИМЕНЕНЫ!                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Откройте в браузере:
echo    • https://tomich.fun - главная страница
echo    • https://tomich.fun/downloads - скачивание (теперь через прокси!)
echo    • https://tomich.fun/admin - админ-панель
echo    • https://tomich.fun/admin/telemetry.html - телеметрия (новое!)
echo.
echo ✅ Что исправлено:
echo    • Телеметрия: убрана авторизация, добавлен trust proxy
echo    • Website: добавлен прокси для скачивания с приватного GitHub
echo    • Website: добавлена страница телеметрии в админке
echo    • Website: убраны все ссылки на GitHub из публичных страниц
echo.
echo 🔒 Теперь можно закрыть репозиторий GitHub!
echo.
pause
goto end

:error
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ❌ ОШИБКА ПРИ ЗАГРУЗКЕ!                                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Проверьте:
echo  • Правильность пароля (SMU1t1_yKM)
echo  • Доступность сервера tomich.fun
echo  • Права доступа к файлам на сервере
echo.
pause
exit /b 1

:end



