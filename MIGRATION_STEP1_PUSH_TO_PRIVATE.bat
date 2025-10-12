@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         МИГРАЦИЯ: Шаг 1 - Перенос в приватный репо            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d D:\3DC

echo [1/6] Проверка текущего состояния...
git status
echo.

echo [2/6] Коммит всех изменений перед миграцией...
git add .
git commit -m "Prepare for migration: v1.5.35 with site-based update check"
echo.

echo [3/6] Переименование старого remote...
git remote rename origin old-origin
echo ✓ Старый remote переименован в 'old-origin'
echo.

echo [4/6] Добавление нового приватного репозитория...
git remote add origin https://github.com/Tombraider2006/3DPC-Private.git
echo ✓ Новый remote добавлен: 3DPC-Private
echo.

echo [5/6] Отправка кода в новый репозиторий...
git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ ОШИБКА: Не удалось отправить код!
    echo.
    echo Возможные причины:
    echo - Репозиторий не создан на GitHub
    echo - Нет прав доступа
    echo - Проблемы с подключением
    echo.
    pause
    exit /b 1
)
echo ✓ Код успешно отправлен
echo.

echo [6/6] Отправка тегов...
git push origin --tags
echo ✓ Теги отправлены
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ ШАГ 1 ЗАВЕРШЕН!                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Код успешно перенесен в приватный репозиторий:
echo https://github.com/Tombraider2006/3DPC-Private
echo.
echo СЛЕДУЮЩИЙ ШАГ: Обновить сайт (запустите MIGRATION_STEP2_UPDATE_WEBSITE.bat)
echo.
pause

