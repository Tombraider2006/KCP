@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║            МИГРАЦИЯ: Шаг 2 - Обновление сайта                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d D:\3DC\website

echo [1/3] Загрузка downloads.js на сервер...
scp public\js\downloads.js root@tomich.fun:/opt/website/public/js/
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА: Не удалось загрузить downloads.js
    pause
    exit /b 1
)
echo ✓ downloads.js загружен
echo.

echo [2/3] Загрузка api.js на сервер...
scp routes\api.js root@tomich.fun:/opt/website/routes/
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА: Не удалось загрузить api.js
    pause
    exit /b 1
)
echo ✓ api.js загружен
echo.

echo [3/3] Перезапуск Docker на сервере...
ssh root@tomich.fun "cd /opt/website && docker compose restart"
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА: Не удалось перезапустить Docker
    pause
    exit /b 1
)
echo ✓ Docker перезапущен
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║             ⚠️  ВАЖНО: РУЧНЫЕ ДЕЙСТВИЯ ТРЕБУЮТСЯ!             ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Вам нужно вручную обновить .env на сервере:
echo.
echo 1. Подключитесь к серверу:
echo    ssh root@tomich.fun
echo.
echo 2. Откройте файл:
echo    nano /opt/website/.env
echo.
echo 3. Измените следующие строки:
echo    GITHUB_REPO=3DPC-Private
echo    GITHUB_TOKEN=ваш_новый_токен_с_доступом_к_приватному_репо
echo.
echo 4. Сохраните: Ctrl+X, Y, Enter
echo.
echo 5. Перезапустите Docker:
echo    docker compose restart
echo.
echo 6. Проверьте что работает:
echo    curl http://localhost:3000/api/latest-version
echo.
echo.
echo СЛЕДУЮЩИЙ ШАГ: Закрыть старый KCP (запустите MIGRATION_STEP3_CLOSE_OLD_KCP.bat)
echo.
pause

