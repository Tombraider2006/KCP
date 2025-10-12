@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           Уборка папки website - удаление старых файлов       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d %~dp0

echo Создание папок archive и docs...
if not exist "archive" mkdir archive
if not exist "docs" mkdir docs
echo ✓ Папки созданы
echo.

echo Перемещение старых батников в archive...
move /Y UPLOAD_*.bat archive\ 2>nul
move /Y REUPLOAD_*.bat archive\ 2>nul
move /Y CHECK_PERMISSIONS.bat archive\ 2>nul
move /Y QUICK_UPDATE.bat archive\ 2>nul
echo ✓ Батники перемещены
echo.

echo Перемещение документации в docs...
move /Y QUICK_*.md docs\ 2>nul
move /Y SUMMARY.md docs\ 2>nul
move /Y TODO.md docs\ 2>nul
move /Y UPDATE_SERVER.md docs\ 2>nul
move /Y UPLOAD_FILES.md docs\ 2>nul
echo ✓ Документация перемещена
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ УБОРКА ЗАВЕРШЕНА!                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo В корне остались только актуальные файлы:
echo.
dir /b *.bat *.md *.js *.sh *.txt *.json 2>nul
echo.
pause

