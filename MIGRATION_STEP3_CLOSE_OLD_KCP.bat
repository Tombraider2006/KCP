@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          МИГРАЦИЯ: Шаг 3 - Закрытие старого KCP               ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo ВНИМАНИЕ: Этот скрипт создаст заглушку в старом репозитории KCP
echo.
echo Выберите вариант:
echo 1) Оставить репо публичным с заглушкой (РЕКОМЕНДУЮ)
echo 2) Только подготовить заглушку (закрыть вручную позже)
echo 3) Отмена
echo.
set /p choice="Ваш выбор (1-3): "

if "%choice%"=="3" (
    echo Отменено пользователем
    pause
    exit /b 0
)

cd /d D:\3DC

echo.
echo [1/7] Создание резервного тега...
git tag -a v1.5.34-before-migration -m "Backup before migration to private repo"
echo ✓ Тег создан: v1.5.34-before-migration
echo.

echo [2/7] Переключение на старый репозиторий...
git remote set-url old-origin https://github.com/Tombraider2006/KCP.git
echo ✓ Remote настроен
echo.

echo [3/7] Создание ветки archive...
git checkout -b archive
if %errorlevel% neq 0 (
    echo Ветка уже существует, переключаемся...
    git checkout archive
)
echo ✓ Ветка archive создана/активирована
echo.

echo [4/7] Удаление файлов (оставляем только README и LICENSE)...
git rm -rf src docs dist-electron build icons server-telemetry website temp_artifacts node_modules 2>nul
git rm -rf package.json package-lock.json logo.png PRIVATE_NOTES.md 2>nul
git rm -rf *.bat *.tar.gz FINAL_FILES_LIST.md MIGRATION_PLAN.md 2>nul
echo ✓ Файлы удалены из индекса
echo.

echo [5/7] Копирование заглушки README...
copy /Y KCP-README-STUB.md README.md
git add README.md
if exist LICENSE.md git add LICENSE.md
echo ✓ README заменен на заглушку
echo.

echo [6/7] Создание коммита...
git commit -m "Archive: Project moved to private repository. Downloads at tomich.fun"
if %errorlevel% neq 0 (
    echo Нет изменений для коммита или ошибка
)
echo ✓ Коммит создан
echo.

if "%choice%"=="1" (
    echo [7/7] Отправка в старый KCP...
    echo.
    echo ВНИМАНИЕ: Сейчас будет выполнен FORCE PUSH!
    echo Это перезапишет содержимое репозитория KCP заглушкой.
    echo.
    set /p confirm="Вы уверены? (yes/no): "
    
    if /i "%confirm%"=="yes" (
        git push old-origin archive:main --force
        if %errorlevel% neq 0 (
            echo ❌ ОШИБКА: Не удалось отправить изменения
            echo Возможно нужно удалить защиту ветки main на GitHub
            pause
            exit /b 1
        )
        echo ✓ Заглушка установлена в KCP
    ) else (
        echo Отправка отменена
    )
) else (
    echo [7/7] Пропущено (выбрано ручное закрытие)
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ ШАГ 3 ЗАВЕРШЕН!                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

if "%choice%"=="1" (
    echo Старый репозиторий KCP теперь содержит заглушку:
    echo https://github.com/Tombraider2006/KCP
    echo.
    echo Пользователи увидят ссылку на tomich.fun
) else (
    echo Заглушка подготовлена локально.
    echo.
    echo Чтобы применить изменения:
    echo git push old-origin archive:main --force
    echo.
    echo Или закройте репо вручную через Settings GitHub
)

echo.
echo СЛЕДУЮЩИЙ ШАГ: Проверить что все работает
echo - https://tomich.fun/downloads
echo - https://github.com/Tombraider2006/KCP
echo - https://github.com/Tombraider2006/3DPC-Private
echo.

echo.
echo Вернуться к основной ветке?
set /p return="Вернуться к main? (yes/no): "
if /i "%return%"=="yes" (
    git checkout main
    git remote set-url origin https://github.com/Tombraider2006/3DPC-Private.git
    echo ✓ Вернулись к ветке main с новым origin
)

pause

