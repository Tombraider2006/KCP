@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║      Загрузка файлов миграции на сервер tomich.fun            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ВНИМАНИЕ: Этот скрипт загружает подготовленные файлы на сервер
echo.
echo Что будет загружено:
echo  1. routes/api.js - новый API /latest-version
echo  2. routes/docs.js - динамические страницы документации
echo  3. public/js/downloads.js - обновленное имя репо
echo  4. server.js - настройка EJS и новые routes
echo  5. docs-content/*.md - документация
echo  6. views/*.ejs - шаблоны
echo.

set /p confirm="Продолжить загрузку? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Отменено
    pause
    exit /b 0
)

cd /d %~dp0

echo.
echo [1/8] Загрузка routes/api.js...
scp routes\api.js root@tomich.fun:/opt/website/routes/
if %errorlevel% neq 0 goto :error
echo ✓ api.js загружен
echo.

echo [2/8] Загрузка routes/docs.js...
scp routes\docs.js root@tomich.fun:/opt/website/routes/
if %errorlevel% neq 0 goto :error
echo ✓ docs.js загружен
echo.

echo [3/8] Загрузка downloads.js (обновленный репо)...
scp public\js\downloads.js root@tomich.fun:/opt/website/public/js/
if %errorlevel% neq 0 goto :error
echo ✓ downloads.js загружен
echo.

echo [4/8] Загрузка server.js...
scp server.js root@tomich.fun:/opt/website/
if %errorlevel% neq 0 goto :error
echo ✓ server.js загружен
echo.

echo [5/8] Загрузка EJS шаблонов...
scp -r views root@tomich.fun:/opt/website/
if %errorlevel% neq 0 goto :error
echo ✓ Шаблоны загружены
echo.

echo [6/8] Загрузка документации...
scp -r docs-content root@tomich.fun:/opt/website/
if %errorlevel% neq 0 goto :error
echo ✓ Документация загружена
echo.

echo [7/8] Установка зависимостей на сервере...
ssh root@tomich.fun "cd /opt/website && npm install ejs marked highlight.js --save"
if %errorlevel% neq 0 (
    echo ⚠️ Не удалось установить зависимости
    echo Попробуйте вручную: ssh root@tomich.fun "cd /opt/website && npm install"
)
echo ✓ Зависимости установлены
echo.

echo [8/8] Перезапуск Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"
if %errorlevel% neq 0 goto :error
echo ✓ Docker перезапущен
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ ЗАГРУЗКА ЗАВЕРШЕНА!                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ══════════════════════════════════════════════════════════════════
echo  ВАЖНО: Обновите .env на сервере!
echo ══════════════════════════════════════════════════════════════════
echo.
echo ssh root@tomich.fun
echo nano /opt/website/.env
echo.
echo Измените:
echo   GITHUB_REPO=3DPC-Private
echo   GITHUB_TOKEN=ваш_новый_токен
echo.
echo Сохраните: Ctrl+X, Y, Enter
echo Перезапустите: docker compose restart
echo.
echo ══════════════════════════════════════════════════════════════════
echo  Проверьте работу:
echo ══════════════════════════════════════════════════════════════════
echo.
echo ✓ https://tomich.fun/api/latest-version
echo ✓ https://tomich.fun/docs/web-server
echo ✓ https://tomich.fun/docs/tuya-guide
echo ✓ https://tomich.fun/docs/homeassistant-guide
echo ✓ https://tomich.fun/license
echo ✓ https://tomich.fun/downloads
echo.
pause
exit /b 0

:error
echo.
echo ❌ ОШИБКА при загрузке файлов!
echo.
echo Проверьте:
echo - Подключение к серверу (SSH доступен?)
echo - Пароль правильный?
echo - Права доступа к файлам?
echo.
pause
exit /b 1

