@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         Уборка корня проекта - удаление устаревших файлов     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d %~dp0

echo Создание папки archive...
if not exist "archive" mkdir archive
if not exist "archive\old-uploads" mkdir archive\old-uploads
if not exist "archive\old-docs" mkdir archive\old-docs
echo ✓ Папки созданы
echo.

echo ══════════════════════════════════════════════════════════════════
echo  Шаг 1: Старые батники загрузки
echo ══════════════════════════════════════════════════════════════════
echo.
echo Перемещение устаревших батников...
move /Y GO.bat archive\old-uploads\ 2>nul
move /Y FINAL_UPLOAD.bat archive\old-uploads\ 2>nul
move /Y SIMPLE_UPLOAD.bat archive\old-uploads\ 2>nul
move /Y SUPER_SIMPLE.bat archive\old-uploads\ 2>nul
move /Y UPLOAD_ALL_UPDATES.bat archive\old-uploads\ 2>nul
move /Y UPLOAD_FINAL.bat archive\old-uploads\ 2>nul
echo ✓ Старые батники перемещены
echo.

echo ══════════════════════════════════════════════════════════════════
echo  Шаг 2: Архивы и tar.gz
echo ══════════════════════════════════════════════════════════════════
echo.
echo Перемещение архивов...
move /Y updates.tar.gz archive\ 2>nul
move /Y updates_final.tar.gz archive\ 2>nul
echo ✓ Архивы перемещены
echo.

echo ══════════════════════════════════════════════════════════════════
echo  Шаг 3: Устаревшие документы
echo ══════════════════════════════════════════════════════════════════
echo.
echo Перемещение устаревших MD файлов...
move /Y FINAL_FILES_LIST.md archive\old-docs\ 2>nul
move /Y UPDATES_SUMMARY.md archive\old-docs\ 2>nul
echo ✓ Устаревшие документы перемещены
echo.

echo ══════════════════════════════════════════════════════════════════
echo  Шаг 4: Анализ docs/ папки
echo ══════════════════════════════════════════════════════════════════
echo.
echo Проверка устаревших документов в docs/...

REM Перемещение устаревших фиксов и саммари
if exist "docs\FIX_SUMMARY_2025_10_10.md" (
    move /Y "docs\FIX_SUMMARY_2025_10_10.md" archive\old-docs\ 2>nul
    echo ✓ FIX_SUMMARY_2025_10_10.md перемещен
)

if exist "docs\WORK_SUMMARY_2025_10_10.md" (
    move /Y "docs\WORK_SUMMARY_2025_10_10.md" archive\old-docs\ 2>nul
    echo ✓ WORK_SUMMARY_2025_10_10.md перемещен
)

if exist "docs\DOCS_CLEANUP_2025_10_11.md" (
    move /Y "docs\DOCS_CLEANUP_2025_10_11.md" archive\old-docs\ 2>nul
    echo ✓ DOCS_CLEANUP_2025_10_11.md перемещен
)

if exist "docs\DOCUMENTATION_CLEANUP_SUMMARY.md" (
    move /Y "docs\DOCUMENTATION_CLEANUP_SUMMARY.md" archive\old-docs\ 2>nul
    echo ✓ DOCUMENTATION_CLEANUP_SUMMARY.md перемещен
)

if exist "docs\RENDERER_STRUCTURE_ADDED.md" (
    move /Y "docs\RENDERER_STRUCTURE_ADDED.md" archive\old-docs\ 2>nul
    echo ✓ RENDERER_STRUCTURE_ADDED.md перемещен
)

if exist "docs\KLIPPER_STATUS_FIX.md" (
    move /Y "docs\KLIPPER_STATUS_FIX.md" archive\old-docs\ 2>nul
    echo ✓ KLIPPER_STATUS_FIX.md перемещен
)

if exist "docs\SCANNER_UX_FIX.md" (
    move /Y "docs\SCANNER_UX_FIX.md" archive\old-docs\ 2>nul
    echo ✓ SCANNER_UX_FIX.md перемещен
)

if exist "docs\ANALYTICS_FIXES_APPLIED.md" (
    move /Y "docs\ANALYTICS_FIXES_APPLIED.md" archive\old-docs\ 2>nul
    echo ✓ ANALYTICS_FIXES_APPLIED.md перемещен
)

if exist "docs\ANALYTICS_LOGIC_ISSUES.md" (
    move /Y "docs\ANALYTICS_LOGIC_ISSUES.md" archive\old-docs\ 2>nul
    echo ✓ ANALYTICS_LOGIC_ISSUES.md перемещен
)

echo.

echo ══════════════════════════════════════════════════════════════════
echo  Шаг 5: Старые release notes
echo ══════════════════════════════════════════════════════════════════
echo.
echo Создание архива для старых release notes...
if not exist "archive\old-releases" mkdir archive\old-releases

if exist "docs\RELEASE_NOTES_1.5.28.md" (
    move /Y "docs\RELEASE_NOTES_1.5.28.md" archive\old-releases\ 2>nul
)
if exist "docs\RELEASE_NOTES_1.5.29.md" (
    move /Y "docs\RELEASE_NOTES_1.5.29.md" archive\old-releases\ 2>nul
)
if exist "docs\RELEASE_NOTES_1.5.30.md" (
    move /Y "docs\RELEASE_NOTES_1.5.30.md" archive\old-releases\ 2>nul
)
echo ✓ Старые release notes перемещены (оставлен 1.5.33 и RELEASE_NOTES.md)
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ УБОРКА ЗАВЕРШЕНА!                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo ══════════════════════════════════════════════════════════════════
echo  АКТУАЛЬНЫЕ ФАЙЛЫ В КОРНЕ:
echo ══════════════════════════════════════════════════════════════════
echo.
dir /b *.bat *.md 2>nul | findstr /V "CLEANUP_PROJECT_ROOT.bat"
echo.

echo ══════════════════════════════════════════════════════════════════
echo  СТРУКТУРА АРХИВА:
echo ══════════════════════════════════════════════════════════════════
echo.
echo archive\
echo   ├── old-uploads\     (6 старых батников)
echo   ├── old-docs\        (устаревшие документы)
echo   ├── old-releases\    (старые release notes)
echo   ├── updates.tar.gz
echo   └── updates_final.tar.gz
echo.

echo ══════════════════════════════════════════════════════════════════
echo  АКТУАЛЬНАЯ ДОКУМЕНТАЦИЯ В docs/:
echo ══════════════════════════════════════════════════════════════════
echo.
echo ✓ PWA_IMPLEMENTATION_CHECKLIST.md
echo ✓ ESM_MIGRATION_PLAN.md
echo ✓ SMART_PLUGS_IMPLEMENTATION_PLAN.md
echo ✓ SMART_PLUGS_FINAL_SUMMARY.md
echo ✓ RELEASE_NOTES.md
echo ✓ RELEASE_NOTES_1.5.33_SMART_PLUGS.md
echo ✓ changelog.md
echo ✓ README_EN.md
echo ✓ INDEX.md
echo ✓ Руководства пользователя (Bambu, Tuya, Home Assistant, Web Server)
echo ✓ Tablet документация
echo.

echo Можно удалить CLEANUP_PROJECT_ROOT.bat после проверки результатов
echo.
pause

